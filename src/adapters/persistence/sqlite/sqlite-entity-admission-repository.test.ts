import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import Database from "better-sqlite3";

import { ReviewEntityCandidate } from "../../../domains/person-knowledge/application/review-entity-candidate.js";
import { EntityAdmissionConflictError } from "../../../domains/person-knowledge/domain/entity-admission.js";
import { SqliteEntityAdmissionRepository } from "./sqlite-entity-admission-repository.js";

function addFixtures(path: string): void {
  const db = new Database(path);
  try {
    db.exec(`CREATE TABLE person_profiles (id TEXT PRIMARY KEY) STRICT;
      CREATE TABLE entity_candidates (
        id TEXT PRIMARY KEY,
        schema_version TEXT NOT NULL,
        knowledge_space_id TEXT NOT NULL REFERENCES person_profiles(id),
        status TEXT NOT NULL CHECK(status='proposed'),
        entity_type TEXT NOT NULL,
        proposed_name TEXT NOT NULL,
        candidate_json TEXT NOT NULL
      ) STRICT;`);
    db.prepare("INSERT INTO person_profiles VALUES (?)").run("profile-1");
    db.prepare("INSERT INTO person_profiles VALUES (?)").run("profile-2");
    const candidate = {
      schemaVersion: "0.1",
      id: "candidate-1",
      knowledgeSpaceId: "profile-1",
      entityType: "Organisation",
      proposedName: "Lightspeed",
      evidence: [{ artifactId: "artifact-1" }],
      generator: { id: "local-user", type: "human" },
      possibleDuplicateIds: [],
      conflictCandidateIds: [],
      reviewRequirement: "person-required",
      policyLabels: ["private"],
    };
    const insert = db.prepare("INSERT INTO entity_candidates VALUES (?,?,?,?,?,?,?)");
    for (const [id, name] of [
      ["candidate-1", "Lightspeed"],
      ["candidate-2", "Deferred organisation"],
      ["candidate-3", "Rejected organisation"],
    ]) {
      const value = { ...candidate, id, proposedName: name };
      insert.run(
        value.id,
        value.schemaVersion,
        value.knowledgeSpaceId,
        "proposed",
        value.entityType,
        value.proposedName,
        JSON.stringify(value),
      );
    }
  } finally {
    db.close();
  }
}

test("translates a staged candidate and atomically stores an accepted entity", async () => {
  const directory = await mkdtemp(join(tmpdir(), "why-hire-me-admission-"));
  const path = join(directory, "knowledge.db");
  addFixtures(path);
  const repository = new SqliteEntityAdmissionRepository(path);
  const ids = [
    "decision-1", "activity-1", "entity-1",
    "decision-2", "activity-2",
    "decision-3", "activity-3",
  ];
  try {
    const useCase = new ReviewEntityCandidate(
      repository,
      repository,
      { generate: () => ids.shift() ?? "unexpected" },
      { now: () => new Date("2026-09-14T01:02:03.000Z") },
    );
    const request = {
      profileId: "profile-1",
      candidateId: "candidate-1",
      disposition: "accepted" as const,
      reason: "Confirmed by the profile owner.",
      reviewerId: "person-1",
      reviewerAuthority: "person" as const,
      identityResolution: { duplicates: "not-needed" as const, conflicts: "not-needed" as const },
      correlationId: "trace-1",
      idempotencyKey: "review-1",
    };
    const result = await useCase.execute(request);
    const retry = await useCase.execute(request);
    assert.equal(result.entity?.id, "entity-1");
    assert.equal(retry.reused, true);

    const deferred = await useCase.execute({
      ...request,
      candidateId: "candidate-2",
      disposition: "deferred",
      reason: "Need more evidence.",
      correlationId: "trace-2",
      idempotencyKey: "review-2",
    });
    const rejected = await useCase.execute({
      ...request,
      candidateId: "candidate-3",
      disposition: "rejected",
      reason: "This refers to someone else.",
      correlationId: "trace-3",
      idempotencyKey: "review-3",
    });
    assert.equal(deferred.entity, undefined);
    assert.equal(rejected.entity, undefined);

    const db = new Database(path, { readonly: true });
    try {
      assert.equal((db.prepare("SELECT count(*) count FROM canonical_entities").get() as { count: number }).count, 1);
      assert.equal((db.prepare("SELECT count(*) count FROM admission_activities").get() as { count: number }).count, 3);
      assert.equal((db.prepare("SELECT count(*) count FROM entity_admission_decisions").get() as { count: number }).count, 3);
    } finally {
      db.close();
    }

    await assert.rejects(
      () => useCase.execute({ ...request, disposition: "rejected", idempotencyKey: "review-4" }),
      EntityAdmissionConflictError,
    );
    assert.equal(await repository.find("candidate-1", "profile-2"), undefined);
  } finally {
    repository.close();
    await rm(directory, { recursive: true, force: true });
  }
});

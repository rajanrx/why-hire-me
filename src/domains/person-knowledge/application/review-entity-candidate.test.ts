import assert from "node:assert/strict";
import test from "node:test";

import {
  EntityAdmissionConflictError,
  EntityAdmissionValidationError,
  EntityProposalUnavailableError,
  type AdmissionDecision,
  type AdmissionResult,
  type EntityProposal,
} from "../domain/entity-admission.js";
import type { EntityAdmissionRepository } from "../ports/entity-admission-ports.js";
import { ReviewEntityCandidate, type ReviewEntityCandidateRequest } from "./review-entity-candidate.js";

const baseProposal: EntityProposal = {
  candidateId: "candidate-1",
  schemaVersion: "0.1",
  knowledgeSpaceId: "profile-1",
  entityType: "Organisation",
  proposedName: "Lightspeed",
  evidenceCount: 1,
  generatorId: "local-user",
  generatorType: "human",
  possibleDuplicateIds: [],
  conflictCandidateIds: [],
  reviewRequirement: "person-required",
  policyLabels: ["private"],
};

const baseRequest: ReviewEntityCandidateRequest = {
  profileId: "profile-1",
  candidateId: "candidate-1",
  disposition: "accepted",
  reason: "Confirmed from my employment history.",
  reviewerId: "person-1",
  reviewerAuthority: "person",
  identityResolution: { duplicates: "not-needed", conflicts: "not-needed" },
  correlationId: "trace-1",
  idempotencyKey: "review-1",
};

class MemoryAdmissions implements EntityAdmissionRepository {
  public readonly writes: AdmissionResult[] = [];

  public async findByIdempotencyKey(profileId: string, key: string): Promise<AdmissionResult | undefined> {
    return this.writes.find(
      (result) => result.decision.knowledgeSpaceId === profileId && result.decision.idempotencyKey === key,
    );
  }

  public async findTerminalDecision(candidateId: string, profileId: string): Promise<AdmissionDecision | undefined> {
    return this.writes.map((result) => result.decision).find(
      (decision) => decision.candidateId === candidateId &&
        decision.knowledgeSpaceId === profileId &&
        decision.disposition !== "deferred",
    );
  }

  public async record(input: Omit<AdmissionResult, "reused">): Promise<AdmissionResult> {
    const result = Object.freeze({ ...input, reused: false });
    this.writes.push(result);
    return result;
  }
}

function fixture(proposal: EntityProposal | undefined = baseProposal) {
  const admissions = new MemoryAdmissions();
  const generated = ["decision-1", "activity-1", "entity-1", "decision-2", "activity-2", "entity-2"];
  const useCase = new ReviewEntityCandidate(
    { find: async (candidateId, profileId) =>
      proposal?.candidateId === candidateId && proposal.knowledgeSpaceId === profileId ? proposal : undefined },
    admissions,
    { generate: () => generated.shift() ?? "unexpected-id" },
    { now: () => new Date("2026-09-14T01:02:03.000Z") },
  );
  return { useCase, admissions };
}

test("accepts a reviewed proposal and creates canonical entity and activity records", async () => {
  const { useCase, admissions } = fixture();
  const result = await useCase.execute(baseRequest);

  assert.equal(result.decision.disposition, "accepted");
  assert.equal(result.decision.admittedEntityId, "entity-1");
  assert.equal(result.entity?.data.entityType, "Organisation");
  assert.equal(result.entity?.data.attributes.displayName, "Lightspeed");
  assert.equal(result.entity?.generatedBy, "activity-1");
  assert.deepEqual(result.activity.data.inputIds, ["candidate-1"]);
  assert.deepEqual(result.activity.data.outputIds, ["decision-1", "entity-1"]);
  assert.equal(admissions.writes.length, 1);
});

test("records deferral without creating canonical knowledge and permits reconsideration", async () => {
  const { useCase, admissions } = fixture();
  const deferred = await useCase.execute({
    ...baseRequest,
    disposition: "deferred",
    reason: "Need to confirm the organisation identity.",
  });
  assert.equal(deferred.entity, undefined);
  assert.equal(deferred.decision.admittedEntityId, null);

  const accepted = await useCase.execute({
    ...baseRequest,
    idempotencyKey: "review-2",
    correlationId: "trace-2",
  });
  assert.equal(accepted.decision.disposition, "accepted");
  assert.equal(admissions.writes.length, 2);
});

test("requires reviewer authority and explicit identity ambiguity resolution", async () => {
  const proposal = {
    ...baseProposal,
    possibleDuplicateIds: ["candidate-other"],
    conflictCandidateIds: ["candidate-conflict"],
  };
  const { useCase } = fixture(proposal);

  await assert.rejects(
    () => useCase.execute({ ...baseRequest, reviewerAuthority: "policy" }),
    (error: unknown) => error instanceof EntityAdmissionValidationError && /person review/.test(error.message),
  );
  await assert.rejects(
    () => useCase.execute(baseRequest),
    (error: unknown) => error instanceof EntityAdmissionValidationError && /duplicates/.test(error.message),
  );
  await assert.rejects(
    () => useCase.execute({
      ...baseRequest,
      identityResolution: { duplicates: "distinct", conflicts: "resolved" },
    }),
    (error: unknown) => error instanceof EntityAdmissionValidationError && /resolution reason/.test(error.message),
  );

  const accepted = await useCase.execute({
    ...baseRequest,
    identityResolution: {
      duplicates: "distinct",
      conflicts: "resolved",
      reason: "The legal names and employment dates distinguish these records.",
    },
  });
  assert.equal(accepted.decision.disposition, "accepted");
});

test("hides missing and foreign proposals behind one unavailable error", async () => {
  const { useCase } = fixture();
  await assert.rejects(
    () => useCase.execute({ ...baseRequest, profileId: "profile-other" }),
    EntityProposalUnavailableError,
  );
  await assert.rejects(
    () => useCase.execute({ ...baseRequest, candidateId: "missing" }),
    EntityProposalUnavailableError,
  );
});

test("returns an identical retry and rejects changed or post-terminal decisions", async () => {
  const { useCase, admissions } = fixture();
  const first = await useCase.execute(baseRequest);
  const retry = await useCase.execute(baseRequest);
  assert.equal(retry.reused, true);
  assert.equal(retry.entity?.id, first.entity?.id);
  assert.equal(admissions.writes.length, 1);

  await assert.rejects(
    () => useCase.execute({ ...baseRequest, reason: "Changed", disposition: "rejected" }),
    EntityAdmissionConflictError,
  );
  await assert.rejects(
    () => useCase.execute({ ...baseRequest, idempotencyKey: "review-2", disposition: "rejected" }),
    EntityAdmissionConflictError,
  );
});

test("allows rejecting a secret-labelled proposal but never accepting it", async () => {
  const proposal = { ...baseProposal, policyLabels: ["contains-secret"] };
  const acceptedFixture = fixture(proposal);
  await assert.rejects(
    () => acceptedFixture.useCase.execute(baseRequest),
    (error: unknown) => error instanceof EntityAdmissionValidationError && /secret/.test(error.message),
  );

  const rejectedFixture = fixture(proposal);
  const rejected = await rejectedFixture.useCase.execute({ ...baseRequest, disposition: "rejected" });
  assert.equal(rejected.decision.disposition, "rejected");
  assert.equal(rejected.entity, undefined);
});

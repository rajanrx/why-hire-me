import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { LocalReleaseRepository, validateLocalRelease } from "../../../adapters/publication/local-release-repository.js";
import { NodeReleaseDigester } from "../../../adapters/publication/node-release-digester.js";
import type { ReleaseViewInput } from "../domain/knowledge-release.js";
import { CreateLocalKnowledgeRelease } from "./create-local-knowledge-release.js";

const view: ReleaseViewInput = {
  id: "view-1", version: 1, knowledgeSpaceId: "profile-1", subjectDisplayName: "Ada Lovelace",
  purpose: "career portfolio", audience: "public", grantId: "grant-1",
  createdAt: "2026-09-14T00:00:00.000Z", expiresAt: "2026-10-14T00:00:00.000Z",
  records: [{ schemaVersion: "0.1", id: "entity-1", recordType: "Entity", knowledgeSpaceId: "profile-1",
    status: "active", recordedAt: "2026-09-13T00:00:00.000Z", generatedBy: "activity-1", policyLabels: ["shareable"], supersedes: null,
    data: { entityType: "Work", attributes: { displayName: "Analytical Engine" } } },
  { schemaVersion: "0.1", id: "activity-1", recordType: "Activity", knowledgeSpaceId: "profile-1",
    status: "active", recordedAt: "2026-09-13T00:00:00.000Z", generatedBy: "activity-1", policyLabels: ["shareable"], supersedes: null,
    data: { activityType: "entity-admission", outputIds: ["entity-1"] } }],
  limitations: ["Entity-only alpha release."],
};

test("creates deterministic atomic bundles and reuses an identical release", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-release-"));
  try {
    const digester = new NodeReleaseDigester();
    const useCase = new CreateLocalKnowledgeRelease(new LocalReleaseRepository(root, digester), digester,
      { now: () => new Date("2026-09-14T01:00:00.000Z") });
    const first = await useCase.execute(view);
    const second = await useCase.execute(view);
    assert.equal(first.reused, false);
    assert.equal(second.reused, true);
    assert.equal(second.manifest.releaseId, first.manifest.releaseId);
    assert.equal(second.directory, first.directory);
    assert.equal((await validateLocalRelease(first.directory, digester)).valid, true);
    assert.equal(await readFile(join(first.directory, "claims.ndjson"), "utf8"), "");
    assert.match(first.manifest.limitations[0] ?? "", /Entity-only/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("detects payload tampering without canonical storage", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-release-"));
  try {
    const digester = new NodeReleaseDigester();
    const created = await new CreateLocalKnowledgeRelease(new LocalReleaseRepository(root, digester), digester,
      { now: () => new Date("2026-09-14T01:00:00.000Z") }).execute(view);
    await writeFile(join(created.directory, "entities.ndjson"), "{}\n");
    const result = await validateLocalRelease(created.directory, digester);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error) => /digest mismatch/.test(error)));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("detects semantic manifest tampering", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-release-"));
  try {
    const digester = new NodeReleaseDigester();
    const created = await new CreateLocalKnowledgeRelease(new LocalReleaseRepository(root, digester), digester,
      { now: () => new Date("2026-09-14T01:00:00.000Z") }).execute(view);
    const path = join(created.directory, "manifest.json");
    const manifest = JSON.parse(await readFile(path, "utf8")) as Record<string, unknown>;
    manifest.purpose = "changed after confirmation";
    await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`);
    const result = await validateLocalRelease(created.directory, digester);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error) => /identity/.test(error)));

    manifest.purpose = view.purpose;
    const files = manifest.files as Array<Record<string, unknown>>;
    files[0]!.mediaType = "text/plain";
    await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`);
    const invalidMedia = await validateLocalRelease(created.directory, digester);
    assert.equal(invalidMedia.valid, false);
    assert.ok(invalidMedia.errors.some((error) => /invalid media type/.test(error)));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("rejects malformed manifest shapes without throwing", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-release-"));
  try {
    const digester = new NodeReleaseDigester();
    await writeFile(join(root, "manifest.json"), "null\n");
    const nonObject = await validateLocalRelease(root, digester);
    assert.equal(nonObject.valid, false);
    assert.match(nonObject.errors.join(" "), /must contain an object/);

    await writeFile(join(root, "manifest.json"), '{"schema":"why-hire-me.release/v0.1"}\n');
    const incomplete = await validateLocalRelease(root, digester);
    assert.equal(incomplete.valid, false);
    assert.match(incomplete.errors.join(" "), /incomplete or invalid/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("rejects expired, foreign, and secret-labelled view content", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-release-"));
  try {
    const digester = new NodeReleaseDigester();
    const useCase = new CreateLocalKnowledgeRelease(new LocalReleaseRepository(root, digester), digester,
      { now: () => new Date("2026-11-14T01:00:00.000Z") });
    await assert.rejects(() => useCase.execute(view), /expired/);
    const current = new CreateLocalKnowledgeRelease(new LocalReleaseRepository(root, digester), digester,
      { now: () => new Date("2026-09-14T01:00:00.000Z") });
    await assert.rejects(() => current.execute({ ...view, records: [{ ...view.records[0]!, knowledgeSpaceId: "other" }] }), /another knowledge space/);
    await assert.rejects(() => current.execute({ ...view, records: [{ ...view.records[0]!, policyLabels: ["secret"] }] }), /secret/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

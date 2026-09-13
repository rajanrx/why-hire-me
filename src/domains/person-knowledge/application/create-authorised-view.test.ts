import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import type { AdmissionActivity, CanonicalEntity } from "../domain/entity-admission.js";
import { AuthorisedViewConflictError, AuthorisedViewValidationError, type AuthorisedKnowledgeView } from "../domain/authorised-view.js";
import type { AuthorisedViewRepository } from "../ports/authorised-view-ports.js";
import { CreateAuthorisedView, type CreateAuthorisedViewRequest } from "./create-authorised-view.js";

const entity = (id: string, label: string): CanonicalEntity => ({
  schemaVersion: "0.1", id, recordType: "Entity", knowledgeSpaceId: "profile-1", status: "active",
  recordedAt: "2026-09-14T00:00:00.000Z", generatedBy: `activity-${id.replace(/^entity-/, "")}`, policyLabels: [label], supersedes: null,
  data: { entityType: "Work", attributes: { displayName: id } },
});
const activity = (id: string, outputId: string, label: string): AdmissionActivity => ({
  schemaVersion: "0.1", id, recordType: "Activity", knowledgeSpaceId: "profile-1", status: "active",
  recordedAt: "2026-09-14T00:00:00.000Z", generatedBy: id, policyLabels: [label], supersedes: null,
  data: { activityType: "entity-admission", responsibleAgent: "person-1", inputIds: ["candidate"],
    outputIds: ["decision", outputId], startedAt: "2026-09-14T00:00:00.000Z",
    endedAt: "2026-09-14T00:00:00.000Z", outcome: "accepted", limitations: [] },
});

class MemoryViews implements AuthorisedViewRepository {
  public readonly views: AuthorisedKnowledgeView[] = [];
  public async findByIdempotencyKey(profile: string, key: string) {
    return this.views.find((view) => view.knowledgeSpaceId === profile && view.idempotencyKey === key);
  }
  public async findById(id: string, profile: string) {
    return this.views.find((view) => view.id === id && view.knowledgeSpaceId === profile);
  }
  public async nextVersion(profile: string) { return this.views.filter((view) => view.knowledgeSpaceId === profile).length + 1; }
  public async save(view: AuthorisedKnowledgeView) { this.views.push(view); }
}

const request: CreateAuthorisedViewRequest = {
  profileId: "profile-1", purpose: "share career portfolio", audience: "public",
  audienceDescription: "Anyone with the released portfolio", allowedPolicyLabels: ["shareable"],
  expiresAt: "2026-10-14T00:00:00.000Z", reviewerId: "person-1", reviewerAuthority: "person",
  confirmed: true, idempotencyKey: "view-request-1",
};

function fixture() {
  const views = new MemoryViews();
  const ids = ["grant-1", "view-1", "grant-2", "view-2"];
  const useCase = new CreateAuthorisedView({ readAccepted: async () => ({
    subject: { displayName: "Ada" },
    entities: [entity("entity-private", "private"), entity("entity-public", "shareable"), entity("entity-secret", "secret")],
    activities: [activity("activity-private", "entity-private", "private"), activity("activity-public", "entity-public", "shareable"), activity("activity-secret", "entity-secret", "secret")],
  }) }, views, { generate: () => ids.shift() ?? "unexpected" },
  { now: () => new Date("2026-09-14T00:00:00.000Z") },
  { sha256: (value) => createHash("sha256").update(value).digest("hex") });
  return { views, useCase };
}

test("freezes only policy-allowed entities and their activities", async () => {
  const { useCase } = fixture();
  const result = await useCase.execute(request);
  assert.equal(result.reused, false);
  assert.equal(result.view.version, 1);
  assert.deepEqual(result.view.records.map((record) => record.id), ["entity-public", "activity-public"]);
  assert.deepEqual(result.view.excluded, { entities: 2, activities: 2 });
  assert.match(result.view.limitations[0] ?? "", /entity-only|accepted entities/i);
});

test("returns identical retries and rejects changed use of an idempotency key", async () => {
  const { useCase, views } = fixture();
  const first = await useCase.execute(request);
  const retry = await useCase.execute(request);
  assert.equal(retry.reused, true);
  assert.equal(retry.view.id, first.view.id);
  assert.equal(views.views.length, 1);
  await assert.rejects(() => useCase.execute({ ...request, audience: "restricted" }), AuthorisedViewConflictError);
});

test("requires person confirmation and a future expiry", async () => {
  const { useCase } = fixture();
  await assert.rejects(() => useCase.execute({ ...request, confirmed: false }), AuthorisedViewValidationError);
  await assert.rejects(() => useCase.execute({ ...request, reviewerAuthority: "policy" }), AuthorisedViewValidationError);
  await assert.rejects(() => useCase.execute({ ...request, expiresAt: "2026-09-13T00:00:00.000Z" }), AuthorisedViewValidationError);
});

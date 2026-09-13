import {
  AuthorisedViewConflictError,
  AuthorisedViewValidationError,
  type AuthorisedKnowledgeView,
  type DisclosureAudience,
  type DisclosureGrant,
} from "../domain/authorised-view.js";
import type {
  AcceptedKnowledgeReader,
  AuthorisedViewRepository,
  ContentDigester,
} from "../ports/authorised-view-ports.js";

export interface CreateAuthorisedViewRequest {
  readonly profileId: string;
  readonly purpose: string;
  readonly audience: DisclosureAudience;
  readonly audienceDescription: string;
  readonly allowedPolicyLabels: readonly string[];
  readonly expiresAt: string;
  readonly reviewerId: string;
  readonly reviewerAuthority: "person" | "policy";
  readonly confirmed: boolean;
  readonly idempotencyKey: string;
}

function text(value: string, label: string): string {
  const result = value.trim();
  if (result.length === 0) throw new AuthorisedViewValidationError(`${label} must not be empty.`);
  return result;
}

function compareText(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }

function stableRequest(request: CreateAuthorisedViewRequest, labels: readonly string[]): string {
  return JSON.stringify({
    profileId: request.profileId.trim(),
    purpose: request.purpose.trim(),
    audience: request.audience,
    audienceDescription: request.audienceDescription.trim(),
    allowedPolicyLabels: labels,
    expiresAt: request.expiresAt,
    reviewerId: request.reviewerId.trim(),
    reviewerAuthority: request.reviewerAuthority,
    confirmed: request.confirmed,
  });
}

export class CreateAuthorisedView {
  public constructor(
    private readonly knowledge: AcceptedKnowledgeReader,
    private readonly views: AuthorisedViewRepository,
    private readonly ids: { generate(): string },
    private readonly clock: { now(): Date },
    private readonly digester: ContentDigester,
  ) {}

  public async execute(request: CreateAuthorisedViewRequest): Promise<{ view: AuthorisedKnowledgeView; reused: boolean }> {
    const profileId = text(request.profileId, "Profile ID");
    const purpose = text(request.purpose, "Purpose");
    const audienceDescription = text(request.audienceDescription, "Audience description");
    const reviewerId = text(request.reviewerId, "Reviewer ID");
    const idempotencyKey = text(request.idempotencyKey, "Idempotency key");
    if (!request.confirmed) throw new AuthorisedViewValidationError("Explicit confirmation is required.");
    if (request.reviewerAuthority !== "person") {
      throw new AuthorisedViewValidationError("Person authority is required to create a disclosure view.");
    }
    if (!["private", "restricted", "public"].includes(request.audience)) {
      throw new AuthorisedViewValidationError("Unknown disclosure audience.");
    }

    const now = this.clock.now();
    const expiry = new Date(request.expiresAt);
    if (Number.isNaN(now.getTime()) || Number.isNaN(expiry.getTime()) || expiry.getTime() <= now.getTime()) {
      throw new AuthorisedViewValidationError("Expiry must be a valid future timestamp.");
    }
    const labels = Object.freeze([...new Set(request.allowedPolicyLabels.map((label) => text(label, "Policy label")))]
      .sort(compareText));
    const requestFingerprint = this.digester.sha256(stableRequest(request, labels));
    const existing = await this.views.findByIdempotencyKey(profileId, idempotencyKey);
    if (existing !== undefined) {
      if (existing.requestFingerprint !== requestFingerprint) {
        throw new AuthorisedViewConflictError("Idempotency key was already used for a different view request.");
      }
      return Object.freeze({ view: existing, reused: true });
    }

    const snapshot = await this.knowledge.readAccepted(profileId);
    if (snapshot === undefined) throw new AuthorisedViewValidationError("Knowledge space is unavailable.");
    const forbidden = new Set(["secret", "contains-secret"]);
    const allowed = new Set(labels.map((label) => label.toLowerCase()));
    const policyAllowed = (record: { readonly policyLabels: readonly string[] }) =>
      record.policyLabels.every((label) => allowed.has(label.toLowerCase()) && !forbidden.has(label.toLowerCase()));
    const allowedActivities = snapshot.activities.filter(policyAllowed);
    const entityAllowed = (entity: (typeof snapshot.entities)[number]) => policyAllowed(entity) &&
      allowedActivities.some((activity) => activity.id === entity.generatedBy && activity.data.outputIds.includes(entity.id));
    const entities = snapshot.entities.filter(entityAllowed).sort((a, b) => compareText(a.id, b.id));
    const includedEntityIds = new Set(entities.map((entity) => entity.id));
    const activities = allowedActivities.filter((activity) =>
      activity.data.outputIds.some((id) => includedEntityIds.has(id)),
    ).sort((a, b) => compareText(a.id, b.id));
    const timestamp = now.toISOString();
    const grant: DisclosureGrant = Object.freeze({
      schemaVersion: "0.1",
      id: this.ids.generate(),
      knowledgeSpaceId: profileId,
      purpose,
      audience: request.audience,
      audienceDescription,
      allowedPolicyLabels: labels,
      issuedBy: reviewerId,
      issuedAt: timestamp,
      expiresAt: expiry.toISOString(),
      status: "active",
    });
    const view: AuthorisedKnowledgeView = Object.freeze({
      schemaVersion: "0.1",
      id: this.ids.generate(),
      knowledgeSpaceId: profileId,
      subject: Object.freeze({ displayName: snapshot.subject.displayName }),
      version: await this.views.nextVersion(profileId),
      grant,
      createdAt: timestamp,
      expiresAt: expiry.toISOString(),
      records: Object.freeze([...entities, ...activities]),
      excluded: Object.freeze({
        entities: snapshot.entities.length - entities.length,
        activities: snapshot.activities.length - activities.length,
      }),
      limitations: Object.freeze([
        "This release slice contains accepted entities and their admission activities; claim, evidence, and alias admission is not yet implemented.",
      ]),
      idempotencyKey,
      requestFingerprint,
    });
    await this.views.save(view);
    return Object.freeze({ view, reused: false });
  }
}

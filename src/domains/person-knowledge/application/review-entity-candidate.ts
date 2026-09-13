import {
  EntityAdmissionConflictError,
  EntityAdmissionValidationError,
  EntityProposalUnavailableError,
  requiredAdmissionText,
  validateEntityProposal,
  type AdmissionActivity,
  type AdmissionDisposition,
  type AdmissionResult,
  type CanonicalEntity,
  type IdentityResolution,
  type ReviewerAuthority,
} from "../domain/entity-admission.js";
import type {
  EntityAdmissionRepository,
  EntityProposalReader,
} from "../ports/entity-admission-ports.js";

export interface ReviewEntityCandidateRequest {
  readonly profileId: string;
  readonly candidateId: string;
  readonly disposition: AdmissionDisposition;
  readonly reason: string;
  readonly reviewerId: string;
  readonly reviewerAuthority: ReviewerAuthority;
  readonly identityResolution: IdentityResolution;
  readonly correlationId: string;
  readonly idempotencyKey: string;
}

function sameRequest(result: AdmissionResult, request: ReviewEntityCandidateRequest): boolean {
  const decision = result.decision;
  return (
    decision.candidateId === request.candidateId.trim() &&
    decision.knowledgeSpaceId === request.profileId.trim() &&
    decision.disposition === request.disposition &&
    decision.reason === request.reason.trim() &&
    decision.reviewer.id === request.reviewerId.trim() &&
    decision.reviewer.authority === request.reviewerAuthority &&
    decision.identityResolution.duplicates === request.identityResolution.duplicates &&
    decision.identityResolution.conflicts === request.identityResolution.conflicts &&
    (decision.identityResolution.reason ?? "") === (request.identityResolution.reason?.trim() ?? "") &&
    decision.correlationId === request.correlationId.trim()
  );
}

export class ReviewEntityCandidate {
  public constructor(
    private readonly proposals: EntityProposalReader,
    private readonly admissions: EntityAdmissionRepository,
    private readonly ids: { generate(): string },
    private readonly clock: { now(): Date },
  ) {}

  public async execute(request: ReviewEntityCandidateRequest): Promise<AdmissionResult> {
    const profileId = requiredAdmissionText(request.profileId, "Profile ID");
    const candidateId = requiredAdmissionText(request.candidateId, "Candidate ID");
    const reason = requiredAdmissionText(request.reason, "Decision reason");
    const reviewerId = requiredAdmissionText(request.reviewerId, "Reviewer ID");
    const correlationId = requiredAdmissionText(request.correlationId, "Correlation ID");
    const idempotencyKey = requiredAdmissionText(request.idempotencyKey, "Idempotency key");

    if (!["accepted", "rejected", "deferred"].includes(request.disposition)) {
      throw new EntityAdmissionValidationError("Unknown admission disposition.");
    }
    if (!["person", "policy"].includes(request.reviewerAuthority)) {
      throw new EntityAdmissionValidationError("Unknown reviewer authority.");
    }
    if (!["not-needed", "distinct"].includes(request.identityResolution.duplicates)) {
      throw new EntityAdmissionValidationError("Unknown duplicate resolution.");
    }
    if (!["not-needed", "resolved"].includes(request.identityResolution.conflicts)) {
      throw new EntityAdmissionValidationError("Unknown conflict resolution.");
    }

    const existing = await this.admissions.findByIdempotencyKey(profileId, idempotencyKey);
    if (existing !== undefined) {
      if (!sameRequest(existing, request)) {
        throw new EntityAdmissionConflictError("Idempotency key was already used for different input.");
      }
      return Object.freeze({ ...existing, reused: true });
    }

    const proposal = await this.proposals.find(candidateId, profileId);
    if (proposal === undefined) {
      throw new EntityProposalUnavailableError();
    }
    validateEntityProposal(proposal);

    const terminal = await this.admissions.findTerminalDecision(candidateId, profileId);
    if (terminal !== undefined) {
      throw new EntityAdmissionConflictError(`Candidate already has a terminal ${terminal.disposition} decision.`);
    }

    const requiredAuthority = proposal.reviewRequirement === "person-required" ? "person" : "policy";
    if (request.reviewerAuthority !== requiredAuthority) {
      throw new EntityAdmissionValidationError(`${requiredAuthority} review is required for this candidate.`);
    }

    const resolutionReason = request.identityResolution.reason?.trim();
    if (request.disposition === "accepted") {
      if (proposal.policyLabels.some((label) => ["secret", "contains-secret"].includes(label.toLowerCase()))) {
        throw new EntityAdmissionValidationError("A proposal labelled as containing a secret cannot be accepted.");
      }
      if (proposal.possibleDuplicateIds.length > 0 && request.identityResolution.duplicates !== "distinct") {
        throw new EntityAdmissionValidationError("Possible duplicates must be explicitly resolved as distinct.");
      }
      if (proposal.conflictCandidateIds.length > 0 && request.identityResolution.conflicts !== "resolved") {
        throw new EntityAdmissionValidationError("Candidate conflicts must be explicitly resolved.");
      }
      if (
        (proposal.possibleDuplicateIds.length > 0 || proposal.conflictCandidateIds.length > 0) &&
        !resolutionReason
      ) {
        throw new EntityAdmissionValidationError("Identity resolution reason must not be empty.");
      }
    }

    const decidedAt = this.clock.now();
    if (Number.isNaN(decidedAt.getTime())) {
      throw new EntityAdmissionValidationError("Decision time must be valid.");
    }
    const timestamp = decidedAt.toISOString();
    const decisionId = this.ids.generate();
    const activityId = this.ids.generate();
    const entityId = request.disposition === "accepted" ? this.ids.generate() : null;
    const outputIds = entityId === null ? [decisionId] : [decisionId, entityId];

    const decision = Object.freeze({
      id: decisionId,
      candidateId,
      knowledgeSpaceId: profileId,
      disposition: request.disposition,
      reason,
      reviewer: Object.freeze({ id: reviewerId, authority: request.reviewerAuthority }),
      identityResolution: Object.freeze({
        duplicates: request.identityResolution.duplicates,
        conflicts: request.identityResolution.conflicts,
        ...(resolutionReason ? { reason: resolutionReason } : {}),
      }),
      decidedAt: timestamp,
      correlationId,
      idempotencyKey,
      admittedEntityId: entityId,
    });
    const activity: AdmissionActivity = Object.freeze({
      schemaVersion: "0.1",
      id: activityId,
      recordType: "Activity",
      knowledgeSpaceId: profileId,
      status: "active",
      recordedAt: timestamp,
      generatedBy: activityId,
      policyLabels: Object.freeze([...proposal.policyLabels]),
      supersedes: null,
      data: Object.freeze({
        activityType: "entity-admission",
        responsibleAgent: reviewerId,
        inputIds: Object.freeze([candidateId]),
        outputIds: Object.freeze(outputIds),
        startedAt: timestamp,
        endedAt: timestamp,
        outcome: request.disposition,
        limitations: Object.freeze(["Human-led entity review; identity merging is not implemented."]),
      }),
    });
    const entity: CanonicalEntity | undefined = entityId === null ? undefined : Object.freeze({
      schemaVersion: "0.1",
      id: entityId,
      recordType: "Entity",
      knowledgeSpaceId: profileId,
      status: "active",
      recordedAt: timestamp,
      generatedBy: activityId,
      policyLabels: Object.freeze([...proposal.policyLabels]),
      supersedes: null,
      data: Object.freeze({
        entityType: proposal.entityType,
        attributes: Object.freeze({ displayName: proposal.proposedName }),
      }),
    });

    return this.admissions.record({ decision, activity, ...(entity ? { entity } : {}) });
  }
}

export const canonicalEntityTypes = [
  "Person",
  "Organisation",
  "Engagement",
  "Role",
  "Work",
  "Contribution",
  "Artefact",
  "Technology",
  "TechnologyUse",
  "Credential",
] as const;

export type CanonicalEntityType = (typeof canonicalEntityTypes)[number];
export type AdmissionDisposition = "accepted" | "rejected" | "deferred";
export type ReviewerAuthority = "person" | "policy";

export interface EntityProposal {
  readonly candidateId: string;
  readonly schemaVersion: "0.1";
  readonly knowledgeSpaceId: string;
  readonly entityType: CanonicalEntityType;
  readonly proposedName: string;
  readonly evidenceCount: number;
  readonly generatorId: string;
  readonly generatorType: "human" | "model" | "skill" | "import";
  readonly possibleDuplicateIds: readonly string[];
  readonly conflictCandidateIds: readonly string[];
  readonly reviewRequirement: "person-required" | "policy-required";
  readonly policyLabels: readonly string[];
}

export interface IdentityResolution {
  readonly duplicates: "not-needed" | "distinct";
  readonly conflicts: "not-needed" | "resolved";
  readonly reason?: string;
}

export interface AdmissionDecision {
  readonly id: string;
  readonly candidateId: string;
  readonly knowledgeSpaceId: string;
  readonly disposition: AdmissionDisposition;
  readonly reason: string;
  readonly reviewer: {
    readonly id: string;
    readonly authority: ReviewerAuthority;
  };
  readonly identityResolution: IdentityResolution;
  readonly decidedAt: string;
  readonly correlationId: string;
  readonly idempotencyKey: string;
  readonly admittedEntityId: string | null;
}

export interface AdmissionActivity {
  readonly schemaVersion: "0.1";
  readonly id: string;
  readonly recordType: "Activity";
  readonly knowledgeSpaceId: string;
  readonly status: "active";
  readonly recordedAt: string;
  readonly generatedBy: string;
  readonly policyLabels: readonly string[];
  readonly supersedes: null;
  readonly data: {
    readonly activityType: "entity-admission";
    readonly responsibleAgent: string;
    readonly inputIds: readonly string[];
    readonly outputIds: readonly string[];
    readonly startedAt: string;
    readonly endedAt: string;
    readonly outcome: AdmissionDisposition;
    readonly limitations: readonly string[];
  };
}

export interface CanonicalEntity {
  readonly schemaVersion: "0.1";
  readonly id: string;
  readonly recordType: "Entity";
  readonly knowledgeSpaceId: string;
  readonly status: "active";
  readonly recordedAt: string;
  readonly generatedBy: string;
  readonly policyLabels: readonly string[];
  readonly supersedes: null;
  readonly data: {
    readonly entityType: CanonicalEntityType;
    readonly attributes: {
      readonly displayName: string;
    };
  };
}

export interface AdmissionResult {
  readonly decision: AdmissionDecision;
  readonly activity: AdmissionActivity;
  readonly entity?: CanonicalEntity;
  readonly reused: boolean;
}

export class EntityAdmissionValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "EntityAdmissionValidationError";
  }
}

export class EntityProposalUnavailableError extends Error {
  public constructor() {
    super("Entity proposal is unavailable.");
    this.name = "EntityProposalUnavailableError";
  }
}

export class EntityAdmissionConflictError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "EntityAdmissionConflictError";
  }
}

export function requiredAdmissionText(value: string, label: string): string {
  const result = value.trim();
  if (result.length === 0) {
    throw new EntityAdmissionValidationError(`${label} must not be empty.`);
  }
  return result;
}

export function validateEntityProposal(proposal: EntityProposal): void {
  if (proposal.schemaVersion !== "0.1") {
    throw new EntityAdmissionValidationError("Unsupported proposal schema version.");
  }
  if (!canonicalEntityTypes.includes(proposal.entityType)) {
    throw new EntityAdmissionValidationError("Unknown entity type.");
  }
  requiredAdmissionText(proposal.candidateId, "Candidate ID");
  requiredAdmissionText(proposal.knowledgeSpaceId, "Knowledge space ID");
  requiredAdmissionText(proposal.proposedName, "Proposed name");
  requiredAdmissionText(proposal.generatorId, "Generator ID");
  if (!["human", "model", "skill", "import"].includes(proposal.generatorType)) {
    throw new EntityAdmissionValidationError("Unknown proposal generator type.");
  }
  if (!["person-required", "policy-required"].includes(proposal.reviewRequirement)) {
    throw new EntityAdmissionValidationError("Unknown proposal review requirement.");
  }
  if (!Number.isSafeInteger(proposal.evidenceCount) || proposal.evidenceCount < 1) {
    throw new EntityAdmissionValidationError("At least one evidence reference is required.");
  }
}

export const entityTypes = ["Person","Organisation","Engagement","Role","Work","Contribution","Artefact","Technology","TechnologyUse","Credential"] as const;
export type EntityType = typeof entityTypes[number];
export type GeneratorType = "human" | "model" | "skill" | "import";
export type UncertaintyLevel = "low" | "medium" | "high" | "unknown";

export interface EvidenceCitation {
  readonly artifactId: string;
  readonly snapshotId: string;
  readonly snapshotDigest: string;
  readonly lineStart: number;
  readonly lineEnd: number;
  readonly relation: "supports" | "contextualises";
}

export interface EntityCandidate {
  readonly schemaVersion: "0.1";
  readonly id: string;
  readonly recordType: "EntityCandidate";
  readonly knowledgeSpaceId: string;
  readonly status: "proposed";
  readonly entityType: EntityType;
  readonly proposedName: string;
  readonly evidence: readonly EvidenceCitation[];
  readonly generator: { readonly type: GeneratorType; readonly id: string; readonly version: string; readonly modelIdentifier?: string };
  readonly uncertainty: { readonly level: UncertaintyLevel; readonly rationale: string };
  readonly identityHints: readonly { readonly namespace: string; readonly value: string }[];
  readonly possibleDuplicateIds: readonly string[];
  readonly conflictCandidateIds: readonly string[];
  readonly reviewRequirement: "person-required" | "policy-required";
  readonly policyLabels: readonly string[];
}

export interface CandidateSubmission {
  readonly id: string;
  readonly candidateId: string;
  readonly actorId: string;
  readonly correlationId: string;
  readonly submittedAt: string;
}

export class CandidateValidationError extends Error {
  constructor(message: string) { super(message); this.name = "CandidateValidationError"; }
}

export function required(value: string, label: string): string {
  const result=value.trim(); if(!result) throw new CandidateValidationError(`${label} must not be empty.`); return result;
}

export function validateLineRange(start: number, end: number): void {
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<1||end<start) throw new CandidateValidationError("Evidence line range is invalid.");
}

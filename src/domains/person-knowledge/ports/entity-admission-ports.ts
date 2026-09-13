import type {
  AdmissionActivity,
  AdmissionDecision,
  AdmissionResult,
  CanonicalEntity,
  EntityProposal,
} from "../domain/entity-admission.js";

export interface EntityProposalReader {
  find(candidateId: string, knowledgeSpaceId: string): Promise<EntityProposal | undefined>;
}

export interface EntityAdmissionRepository {
  findByIdempotencyKey(
    knowledgeSpaceId: string,
    idempotencyKey: string,
  ): Promise<AdmissionResult | undefined>;
  findTerminalDecision(candidateId: string, knowledgeSpaceId: string): Promise<AdmissionDecision | undefined>;
  record(input: {
    readonly decision: AdmissionDecision;
    readonly activity: AdmissionActivity;
    readonly entity?: CanonicalEntity;
  }): Promise<AdmissionResult>;
}

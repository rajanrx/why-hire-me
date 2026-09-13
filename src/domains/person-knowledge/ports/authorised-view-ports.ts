import type {
  AdmissionActivity,
  CanonicalEntity,
} from "../domain/entity-admission.js";
import type { AuthorisedKnowledgeView } from "../domain/authorised-view.js";

export interface AcceptedKnowledgeSnapshot {
  readonly subject: { readonly displayName: string };
  readonly entities: readonly CanonicalEntity[];
  readonly activities: readonly AdmissionActivity[];
}

export interface AcceptedKnowledgeReader {
  readAccepted(knowledgeSpaceId: string): Promise<AcceptedKnowledgeSnapshot | undefined>;
}

export interface AuthorisedViewRepository {
  findByIdempotencyKey(
    knowledgeSpaceId: string,
    idempotencyKey: string,
  ): Promise<AuthorisedKnowledgeView | undefined>;
  findById(viewId: string, knowledgeSpaceId: string): Promise<AuthorisedKnowledgeView | undefined>;
  nextVersion(knowledgeSpaceId: string): Promise<number>;
  save(view: AuthorisedKnowledgeView): Promise<void>;
}

export interface ContentDigester {
  sha256(content: string): string;
}

import type { CandidateSubmission, EntityCandidate, EvidenceCitation } from "../domain/entity-candidate.js";

export interface CandidateEvidenceReader {
  resolve(input: { readonly profileId: string; readonly artifactId: string; readonly lineStart: number; readonly lineEnd: number; readonly relation: "supports"|"contextualises" }): Promise<EvidenceCitation>;
}
export interface CandidateRepository {
  stage(candidate: Omit<EntityCandidate,"id">, submission: Omit<CandidateSubmission,"candidateId">): Promise<{candidate:EntityCandidate;submission:CandidateSubmission;reused:boolean}>;
}
export class CandidateEvidenceUnavailableError extends Error {
  constructor() { super("Candidate evidence is unavailable in the requested knowledge space."); this.name="CandidateEvidenceUnavailableError"; }
}

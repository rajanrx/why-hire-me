import type { ExtractionAttempt, ExtractorIdentity, TextArtifact } from "../domain/text-extraction.js";

export interface CapturedEvidence {
  readonly profileId: string;
  readonly captureId: string;
  readonly snapshotId: string;
  readonly snapshotDigest: string;
  readonly locator: string;
  readonly bytes: AsyncIterable<Uint8Array>;
}

export interface CapturedEvidenceReader {
  read(profileId: string, captureId: string): Promise<CapturedEvidence>;
}

export interface TextExtractor {
  readonly identity: ExtractorIdentity;
  supports(locator: string): boolean;
  extract(bytes: AsyncIterable<Uint8Array>): Promise<{ readonly text: string; readonly lineCount: number }>;
}

export interface TextArtifactRepository {
  store(input: Omit<TextArtifact, "id" | "outputDigest" | "storageKey"> & { readonly text: string }): Promise<TextArtifact>;
  record(attempt: ExtractionAttempt): Promise<void>;
}

export class EvidenceReadError extends Error {
  constructor(message: string) { super(message); this.name = "EvidenceReadError"; }
}

export class TextExtractionError extends Error {
  constructor(readonly code: "INVALID_UTF8", message: string) { super(message); this.name = "TextExtractionError"; }
}

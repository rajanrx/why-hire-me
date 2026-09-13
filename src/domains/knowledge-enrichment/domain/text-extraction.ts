export interface ExtractorIdentity {
  readonly id: string;
  readonly version: string;
  readonly configurationFingerprint: string;
}

export interface TextArtifact {
  readonly id: string;
  readonly profileId: string;
  readonly captureId: string;
  readonly snapshotId: string;
  readonly snapshotDigest: string;
  readonly extractor: ExtractorIdentity;
  readonly outputDigest: string;
  readonly lineCount: number;
  readonly storageKey: string;
}

interface AttemptBase {
  readonly id: string;
  readonly profileId: string;
  readonly captureId: string;
  readonly snapshotId?: string;
  readonly extractor?: ExtractorIdentity;
  readonly extractedAt: string;
}

export type ExtractionAttempt =
  | (AttemptBase & { readonly outcome: "completed"; readonly artifact: TextArtifact })
  | (AttemptBase & {
      readonly outcome: "failed";
      readonly errorCode: "CAPTURE_UNAVAILABLE" | "UNSUPPORTED_FORMAT" | "INVALID_UTF8" | "EVIDENCE_READ_FAILED" | "STORAGE_FAILED";
      readonly diagnostic: string;
    });

export function lineLocator(artifactId: string, line: number): string {
  if (!artifactId.trim() || !Number.isSafeInteger(line) || line < 1) throw new Error("Invalid line locator.");
  return `${artifactId}#L${line}`;
}

export const releasePayloadFiles = [
  "entities.ndjson",
  "claims.ndjson",
  "evidence.ndjson",
  "activities.ndjson",
  "aliases.ndjson",
] as const;

export interface ReleaseInputRecord {
  readonly schemaVersion: string;
  readonly id: string;
  readonly recordType: "Entity" | "Claim" | "Evidence" | "Activity" | "Alias";
  readonly knowledgeSpaceId: string;
  readonly status: "active";
  readonly recordedAt: string;
  readonly generatedBy: string;
  readonly policyLabels: readonly string[];
  readonly supersedes: string | null;
  readonly data: unknown;
}

export interface ReleaseViewInput {
  readonly id: string;
  readonly version: number;
  readonly knowledgeSpaceId: string;
  readonly subjectDisplayName: string;
  readonly purpose: string;
  readonly audience: "private" | "restricted" | "public";
  readonly grantId: string;
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly records: readonly ReleaseInputRecord[];
  readonly limitations: readonly string[];
}

export interface ReleaseFileManifest {
  readonly path: (typeof releasePayloadFiles)[number];
  readonly mediaType: "application/x-ndjson";
  readonly bytes: number;
  readonly records: number;
  readonly sha256: string;
}

export interface KnowledgeReleaseManifest {
  readonly schema: "why-hire-me.release/v0.1";
  readonly releaseId: string;
  readonly releaseDigest: string;
  readonly view: {
    readonly id: string;
    readonly version: number;
    readonly knowledgeSpaceId: string;
    readonly grantId: string;
    readonly expiresAt: string;
  };
  readonly subject: { readonly displayName: string };
  readonly purpose: string;
  readonly audience: "private" | "restricted" | "public";
  readonly createdAt: string;
  readonly files: readonly ReleaseFileManifest[];
  readonly counts: Readonly<Record<(typeof releasePayloadFiles)[number], number>>;
  readonly limitations: readonly string[];
  readonly compatibility: { readonly minimumReader: "0.1.0" };
}

export interface KnowledgeReleaseBundle {
  readonly manifest: KnowledgeReleaseManifest;
  readonly files: Readonly<Record<(typeof releasePayloadFiles)[number], string>>;
}

export interface ReleaseValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly manifest?: KnowledgeReleaseManifest;
}

export class KnowledgeReleaseValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "KnowledgeReleaseValidationError";
  }
}

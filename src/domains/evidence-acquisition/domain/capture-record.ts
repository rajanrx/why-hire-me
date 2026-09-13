import type { PersonProfileId } from "../../person-knowledge/domain/person-profile.js";

export type CaptureId = string & { readonly captureId: unique symbol };
export type SourceId = string & { readonly sourceId: unique symbol };
export type SnapshotId = string & { readonly snapshotId: unique symbol };

export interface ConnectorIdentity {
  readonly id: string;
  readonly version: string;
  readonly configurationFingerprint: string;
}

export interface SnapshotDescriptor {
  readonly id: SnapshotId;
  readonly algorithm: "sha256";
  readonly digest: string;
  readonly byteLength: number;
  readonly storageKey: string;
}

interface CaptureProvenance {
  readonly id: CaptureId;
  readonly profileId: PersonProfileId;
  readonly knowledgeSpaceId: string;
  readonly actorId: string;
  readonly purpose: string;
  readonly permissionScope: string;
  readonly idempotencyKey: string;
  readonly correlationId: string;
  readonly requestedLocator: string;
  readonly connector: ConnectorIdentity;
  readonly capturedAt: string;
}

export interface CompletedCapture extends CaptureProvenance {
  readonly outcome: "completed";
  readonly sourceId: SourceId;
  readonly resolvedLocator: string;
  readonly snapshot: SnapshotDescriptor;
}

export type CaptureErrorCode =
  | "SOURCE_NOT_FOUND"
  | "SOURCE_NOT_REGULAR_FILE"
  | "SOURCE_NOT_READABLE"
  | "SNAPSHOT_STORAGE_FAILED";

export interface FailedCapture extends CaptureProvenance {
  readonly outcome: "failed";
  readonly resolvedLocator?: string;
  readonly errorCode: CaptureErrorCode;
  readonly diagnostic: string;
}

export type CaptureRecord = CompletedCapture | FailedCapture;

interface CompletedCaptureInput {
  readonly id: string;
  readonly profileId: string;
  readonly knowledgeSpaceId: string;
  readonly actorId: string;
  readonly purpose: string;
  readonly permissionScope: string;
  readonly idempotencyKey: string;
  readonly correlationId: string;
  readonly sourceId: string;
  readonly requestedLocator: string;
  readonly resolvedLocator: string;
  readonly connector: ConnectorIdentity;
  readonly capturedAt: Date;
  readonly snapshot: SnapshotDescriptor;
}

interface FailedCaptureInput {
  readonly id: string;
  readonly profileId: string;
  readonly knowledgeSpaceId: string;
  readonly actorId: string;
  readonly purpose: string;
  readonly permissionScope: string;
  readonly idempotencyKey: string;
  readonly correlationId: string;
  readonly requestedLocator: string;
  readonly resolvedLocator?: string;
  readonly connector: ConnectorIdentity;
  readonly capturedAt: Date;
  readonly errorCode: CaptureErrorCode;
  readonly diagnostic: string;
}

function required(value: string, label: string): string {
  const normalised = value.trim();
  if (normalised.length === 0) {
    throw new Error(`${label} must not be empty.`);
  }
  return normalised;
}

function captureTime(value: Date): string {
  if (Number.isNaN(value.getTime())) {
    throw new Error("Capture time must be valid.");
  }
  return value.toISOString();
}

function freezeConnector(connector: ConnectorIdentity): ConnectorIdentity {
  return Object.freeze({
    id: required(connector.id, "Connector ID"),
    version: required(connector.version, "Connector version"),
    configurationFingerprint: required(
      connector.configurationFingerprint,
      "Connector configuration fingerprint",
    ),
  });
}

export function snapshotIdFromDigest(digest: string): SnapshotId {
  const normalised = digest.toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(normalised)) {
    throw new Error("SHA-256 digest must contain 64 hexadecimal characters.");
  }
  return `sha256:${normalised}` as SnapshotId;
}

export function createCompletedCapture(input: CompletedCaptureInput): CompletedCapture {
  if (input.snapshot.id !== snapshotIdFromDigest(input.snapshot.digest)) {
    throw new Error("Snapshot identity must match its digest.");
  }
  if (!Number.isSafeInteger(input.snapshot.byteLength) || input.snapshot.byteLength < 0) {
    throw new Error("Snapshot byte length must be a non-negative safe integer.");
  }

  return Object.freeze({
    id: required(input.id, "Capture ID") as CaptureId,
    profileId: required(input.profileId, "Profile ID") as PersonProfileId,
    knowledgeSpaceId: required(input.knowledgeSpaceId, "Knowledge space ID"),
    actorId: required(input.actorId, "Actor ID"),
    purpose: required(input.purpose, "Purpose"),
    permissionScope: required(input.permissionScope, "Permission scope"),
    idempotencyKey: required(input.idempotencyKey, "Idempotency key"),
    correlationId: required(input.correlationId, "Correlation ID"),
    sourceId: required(input.sourceId, "Source ID") as SourceId,
    requestedLocator: required(input.requestedLocator, "Requested locator"),
    resolvedLocator: required(input.resolvedLocator, "Resolved locator"),
    connector: freezeConnector(input.connector),
    capturedAt: captureTime(input.capturedAt),
    outcome: "completed",
    snapshot: Object.freeze({ ...input.snapshot }),
  });
}

export function createFailedCapture(input: FailedCaptureInput): FailedCapture {
  const base = {
    id: required(input.id, "Capture ID") as CaptureId,
    profileId: required(input.profileId, "Profile ID") as PersonProfileId,
    knowledgeSpaceId: required(input.knowledgeSpaceId, "Knowledge space ID"),
    actorId: required(input.actorId, "Actor ID"),
    purpose: required(input.purpose, "Purpose"),
    permissionScope: required(input.permissionScope, "Permission scope"),
    idempotencyKey: required(input.idempotencyKey, "Idempotency key"),
    correlationId: required(input.correlationId, "Correlation ID"),
    requestedLocator: required(input.requestedLocator, "Requested locator"),
    connector: freezeConnector(input.connector),
    capturedAt: captureTime(input.capturedAt),
    outcome: "failed" as const,
    errorCode: input.errorCode,
    diagnostic: required(input.diagnostic, "Failure diagnostic"),
  };

  return Object.freeze(
    input.resolvedLocator === undefined
      ? base
      : { ...base, resolvedLocator: required(input.resolvedLocator, "Resolved locator") },
  );
}

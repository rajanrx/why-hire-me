import type {
  CaptureId,
  CaptureRecord,
  ConnectorIdentity,
  SourceId,
} from "../domain/capture-record.js";
export interface SourceIdentityInput {
  readonly proposedId: string;
  readonly profileId: string;
  readonly resolvedLocator: string;
  readonly connector: ConnectorIdentity;
}

export interface CaptureRepository {
  resolveSource(input: SourceIdentityInput): Promise<SourceId>;
  record(capture: CaptureRecord): Promise<void>;
  findById(id: CaptureId): Promise<CaptureRecord | undefined>;
}

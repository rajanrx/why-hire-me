import type {
  CaptureId,
  CaptureRecord,
  ConnectorIdentity,
  SourceId,
} from "../domain/capture-record.js";
import type { PersonProfileId } from "../../person-knowledge/domain/person-profile.js";

export interface SourceIdentityInput {
  readonly proposedId: string;
  readonly profileId: PersonProfileId;
  readonly resolvedLocator: string;
  readonly connector: ConnectorIdentity;
}

export interface CaptureRepository {
  resolveSource(input: SourceIdentityInput): Promise<SourceId>;
  record(capture: CaptureRecord): Promise<void>;
  findById(id: CaptureId): Promise<CaptureRecord | undefined>;
}

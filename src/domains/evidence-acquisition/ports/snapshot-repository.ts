import type { SnapshotDescriptor } from "../domain/capture-record.js";

export interface SnapshotRepository {
  store(bytes: AsyncIterable<Uint8Array>): Promise<SnapshotDescriptor>;
  contains(snapshot: SnapshotDescriptor): Promise<boolean>;
}

import { createReadStream } from "node:fs";
import { join } from "node:path";
import type { CaptureId } from "../../domains/evidence-acquisition/domain/capture-record.js";
import type { CaptureRepository } from "../../domains/evidence-acquisition/ports/capture-repository.js";
import { EvidenceReadError, type CapturedEvidenceReader } from "../../domains/knowledge-enrichment/ports/text-extraction-ports.js";

export class LocalCapturedEvidenceReader implements CapturedEvidenceReader {
  constructor(private readonly captures: CaptureRepository, private readonly snapshotRoot: string) {}
  async read(profileId: string, captureId: string) {
    const capture = await this.captures.findById(captureId as CaptureId);
    if (!capture || capture.outcome !== "completed" || capture.profileId !== profileId) {
      throw new EvidenceReadError("Completed captured evidence is unavailable in the requested profile.");
    }
    return Object.freeze({ profileId, captureId, snapshotId: capture.snapshot.id,
      snapshotDigest: capture.snapshot.digest, locator: capture.resolvedLocator,
      bytes: createReadStream(join(this.snapshotRoot, capture.snapshot.storageKey)) });
  }
}

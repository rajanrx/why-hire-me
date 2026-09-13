import type { ExtractionAttempt } from "../domain/text-extraction.js";
import { EvidenceReadError, TextExtractionError, type CapturedEvidenceReader, type TextArtifactRepository, type TextExtractor } from "../ports/text-extraction-ports.js";

export class ExtractEvidenceText {
  constructor(
    private readonly evidence: CapturedEvidenceReader,
    private readonly extractors: readonly TextExtractor[],
    private readonly artifacts: TextArtifactRepository,
    private readonly ids: { generate(): string },
    private readonly clock: { now(): Date },
  ) {}

  async execute(request: { profileId: string; captureId: string }): Promise<ExtractionAttempt> {
    const extractedAt = this.clock.now().toISOString();
    let source;
    try {
      source = await this.evidence.read(request.profileId.trim(), request.captureId.trim());
    } catch (error: unknown) {
      if (!(error instanceof EvidenceReadError)) throw error;
      const attempt = Object.freeze({ id: this.ids.generate(), profileId: request.profileId.trim(),
        captureId: request.captureId.trim(), extractedAt, outcome: "failed" as const,
        errorCode: "CAPTURE_UNAVAILABLE" as const, diagnostic: error.message });
      await this.artifacts.record(attempt);
      return attempt;
    }
    const extractor = this.extractors.find((candidate) => candidate.supports(source.locator));
    if (!extractor) return this.fail(source, extractedAt, "UNSUPPORTED_FORMAT", "No extractor supports the captured evidence format.");
    let output;
    try {
      output = await extractor.extract(source.bytes);
    } catch (error: unknown) {
      const code = error instanceof TextExtractionError ? error.code : "EVIDENCE_READ_FAILED";
      const diagnostic = error instanceof TextExtractionError ? error.message : "The captured evidence could not be read safely.";
      return this.fail(source, extractedAt, code, diagnostic, extractor);
    }
    try {
      const artifact = await this.artifacts.store({
        profileId: source.profileId, captureId: source.captureId, snapshotId: source.snapshotId,
        snapshotDigest: source.snapshotDigest, extractor: extractor.identity,
        lineCount: output.lineCount, text: output.text,
      });
      const attempt = Object.freeze({ id: this.ids.generate(), profileId: source.profileId,
        captureId: source.captureId, snapshotId: source.snapshotId, extractor: extractor.identity,
        extractedAt, outcome: "completed" as const, artifact });
      await this.artifacts.record(attempt);
      return attempt;
    } catch (error: unknown) {
      return this.fail(source, extractedAt, "STORAGE_FAILED", "Extracted text could not be stored safely.", extractor);
    }
  }

  private async fail(source: {profileId:string;captureId:string;snapshotId?:string}, extractedAt: string,
    errorCode: "UNSUPPORTED_FORMAT"|"INVALID_UTF8"|"EVIDENCE_READ_FAILED"|"STORAGE_FAILED", diagnostic: string, extractor?: TextExtractor) {
    const attempt = Object.freeze({ id: this.ids.generate(), profileId: source.profileId,
      captureId: source.captureId, ...(source.snapshotId ? { snapshotId: source.snapshotId } : {}), ...(extractor ? { extractor: extractor.identity } : {}),
      extractedAt, outcome: "failed" as const, errorCode, diagnostic });
    await this.artifacts.record(attempt);
    return attempt;
  }
}

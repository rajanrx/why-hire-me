import {
  createCompletedCapture,
  createFailedCapture,
  type CaptureErrorCode,
  type CaptureRecord,
} from "../domain/capture-record.js";
import type { CaptureRepository } from "../ports/capture-repository.js";
import type { SnapshotRepository } from "../ports/snapshot-repository.js";
import { SourceReadError, type SourceReader } from "../ports/source-reader.js";
import type { KnowledgeSpaceResolver } from "../ports/knowledge-space-resolver.js";

export interface Clock {
  now(): Date;
}

export interface IdGenerator {
  generate(): string;
}

export interface CaptureSourceRequest {
  readonly profileId: string;
  readonly actorId: string;
  readonly purpose: string;
  readonly permissionScope: string;
  readonly idempotencyKey: string;
  readonly correlationId: string;
  readonly requestedLocator: string;
}

export class UnknownPersonProfileError extends Error {
  public constructor(profileId: string) {
    super(`Person profile not found: ${profileId}`);
    this.name = "UnknownPersonProfileError";
  }
}

export class CaptureSource {
  public constructor(
    private readonly profiles: KnowledgeSpaceResolver,
    private readonly reader: SourceReader,
    private readonly snapshots: SnapshotRepository,
    private readonly captures: CaptureRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  public async execute(request: CaptureSourceRequest): Promise<CaptureRecord> {
    const profileId = request.profileId.trim();
    const requestedLocator = request.requestedLocator.trim();
    if (!(await this.profiles.exists(profileId))) {
      throw new UnknownPersonProfileError(profileId);
    }

    const captureId = this.ids.generate();
    const capturedAt = this.clock.now();
    let source;
    try {
      source = await this.reader.read(requestedLocator);
    } catch (error: unknown) {
      return this.recordFailure(captureId, profileId, request, capturedAt, error);
    }

    let snapshot;
    try {
      snapshot = await this.snapshots.store(source.bytes);
    } catch (error: unknown) {
      return this.recordFailure(
        captureId,
        profileId,
        request,
        capturedAt,
        error,
        source.resolvedLocator,
      );
    }

    const sourceId = await this.captures.resolveSource({
      proposedId: this.ids.generate(),
      profileId,
      resolvedLocator: source.resolvedLocator,
      connector: this.reader.connector,
    });
    const completed = createCompletedCapture({
      id: captureId,
      profileId,
      knowledgeSpaceId: profileId,
      actorId: request.actorId,
      purpose: request.purpose,
      permissionScope: request.permissionScope,
      idempotencyKey: request.idempotencyKey,
      correlationId: request.correlationId,
      sourceId,
      requestedLocator: source.requestedLocator,
      resolvedLocator: source.resolvedLocator,
      connector: this.reader.connector,
      capturedAt,
      snapshot,
    });
    await this.captures.record(completed);
    return completed;
  }

  private async recordFailure(
    id: string,
    profileId: string,
    request: CaptureSourceRequest,
    capturedAt: Date,
    error: unknown,
    resolvedLocator?: string,
  ): Promise<CaptureRecord> {
    const sourceError = error instanceof SourceReadError ? error : undefined;
    const errorCode: CaptureErrorCode = sourceError?.code ?? "SNAPSHOT_STORAGE_FAILED";
    const failure = {
      id,
      profileId,
      knowledgeSpaceId: profileId,
      actorId: request.actorId,
      purpose: request.purpose,
      permissionScope: request.permissionScope,
      idempotencyKey: request.idempotencyKey,
      correlationId: request.correlationId,
      requestedLocator: request.requestedLocator,
      connector: this.reader.connector,
      capturedAt,
      errorCode,
      diagnostic: sourceError?.message ?? "The selected source could not be stored safely.",
    };
    const resolved = resolvedLocator ?? sourceError?.resolvedLocator;
    const failed = createFailedCapture(
      resolved === undefined ? failure : { ...failure, resolvedLocator: resolved },
    );
    await this.captures.record(failed);
    return failed;
  }
}

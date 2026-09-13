import type { ConnectorIdentity } from "../domain/capture-record.js";

export type SourceReadErrorCode =
  | "SOURCE_NOT_FOUND"
  | "SOURCE_NOT_REGULAR_FILE"
  | "SOURCE_NOT_READABLE";

export class SourceReadError extends Error {
  public readonly resolvedLocator?: string;

  public constructor(
    public readonly code: SourceReadErrorCode,
    message: string,
    resolvedLocator?: string,
  ) {
    super(message);
    this.name = "SourceReadError";
    if (resolvedLocator !== undefined) {
      this.resolvedLocator = resolvedLocator;
    }
  }
}

export interface SourceContent {
  readonly requestedLocator: string;
  readonly resolvedLocator: string;
  readonly bytes: AsyncIterable<Uint8Array>;
}

export interface SourceReader {
  readonly connector: ConnectorIdentity;
  read(requestedLocator: string): Promise<SourceContent>;
}

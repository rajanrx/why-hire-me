import { open, realpath, stat } from "node:fs/promises";

import {
  SourceReadError,
  type SourceContent,
  type SourceReader,
} from "../../domains/evidence-acquisition/ports/source-reader.js";

async function* readFileBytes(path: string): AsyncIterable<Uint8Array> {
  let handle;
  try {
    handle = await open(path, "r");
    const metadata = await handle.stat();
    if (!metadata.isFile()) {
      throw new SourceReadError(
        "SOURCE_NOT_REGULAR_FILE",
        "The selected source is not a regular file.",
        path,
      );
    }

    const buffer = Buffer.allocUnsafe(64 * 1024);
    let position = 0;
    while (true) {
      const { bytesRead } = await handle.read(buffer, 0, buffer.byteLength, position);
      if (bytesRead === 0) {
        return;
      }
      position += bytesRead;
      yield buffer.subarray(0, bytesRead);
    }
  } catch (error: unknown) {
    if (error instanceof SourceReadError) {
      throw error;
    }
    throw new SourceReadError("SOURCE_NOT_READABLE", "The selected file could not be read.", path);
  } finally {
    await handle?.close();
  }
}

export class LocalFileSourceReader implements SourceReader {
  public readonly connector = Object.freeze({
    id: "local-file",
    version: "1.0.0",
    configurationFingerprint: "single-file-v1",
  });

  public async read(requestedLocator: string): Promise<SourceContent> {
    let resolvedLocator: string;
    try {
      resolvedLocator = await realpath(requestedLocator);
    } catch (error: unknown) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === "ENOENT") {
        throw new SourceReadError("SOURCE_NOT_FOUND", "The selected file does not exist.");
      }
      throw new SourceReadError("SOURCE_NOT_READABLE", "The selected path could not be resolved.");
    }

    let metadata;
    try {
      metadata = await stat(resolvedLocator);
    } catch {
      throw new SourceReadError(
        "SOURCE_NOT_READABLE",
        "The selected file could not be inspected.",
        resolvedLocator,
      );
    }

    if (!metadata.isFile()) {
      throw new SourceReadError(
        "SOURCE_NOT_REGULAR_FILE",
        "The selected source is not a regular file.",
        resolvedLocator,
      );
    }

    return Object.freeze({
      requestedLocator,
      resolvedLocator,
      bytes: readFileBytes(resolvedLocator),
    });
  }
}

import assert from "node:assert/strict";
import { mkdtemp, mkdir, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { SourceReadError } from "../../domains/evidence-acquisition/ports/source-reader.js";
import { LocalFileSourceReader } from "./local-file-source-reader.js";

async function collect(bytes: AsyncIterable<Uint8Array>): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of bytes) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

test("reads only the explicitly selected regular file", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-reader-"));
  const selected = join(root, "resume.txt");
  const neighbour = join(root, "private.txt");
  try {
    await writeFile(selected, "selected content");
    await writeFile(neighbour, "must not appear");
    const reader = new LocalFileSourceReader();
    const source = await reader.read(selected);

    assert.equal(source.requestedLocator, selected);
    assert.equal(source.resolvedLocator, await realpath(selected));
    assert.equal(await collect(source.bytes), "selected content");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects a missing selected path with an explicit error", async () => {
  const reader = new LocalFileSourceReader();
  await assert.rejects(
    reader.read(join(tmpdir(), "why-hire-me-missing-source")),
    (error: unknown) => error instanceof SourceReadError && error.code === "SOURCE_NOT_FOUND",
  );
});

test("rejects a directory instead of traversing it", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-reader-"));
  const directory = join(root, "portfolio");
  try {
    await mkdir(directory);
    const reader = new LocalFileSourceReader();
    await assert.rejects(
      reader.read(directory),
      (error: unknown) =>
        error instanceof SourceReadError && error.code === "SOURCE_NOT_REGULAR_FILE",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

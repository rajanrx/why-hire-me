import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { ContentAddressedSnapshotRepository } from "./content-addressed-snapshot-repository.js";

async function* chunks(...values: string[]): AsyncIterable<Uint8Array> {
  for (const value of values) {
    yield Buffer.from(value);
  }
}

test("streams bytes into a SHA-256 addressed immutable file", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-snapshots-"));
  try {
    const repository = new ContentAddressedSnapshotRepository(root);
    const snapshot = await repository.store(chunks("hello", " world"));

    assert.match(snapshot.digest, /^[a-f0-9]{64}$/);
    assert.equal(snapshot.id, `sha256:${snapshot.digest}`);
    assert.equal(snapshot.byteLength, 11);
    assert.equal(await readFile(join(root, snapshot.storageKey), "utf8"), "hello world");
    assert.equal(await repository.contains(snapshot), true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("reuses the same stored bytes and changes identity when bytes change", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-snapshots-"));
  try {
    const repository = new ContentAddressedSnapshotRepository(root);
    const first = await repository.store(chunks("same"));
    const retry = await repository.store(chunks("same"));
    const changed = await repository.store(chunks("changed"));

    assert.deepEqual(retry, first);
    assert.notEqual(changed.id, first.id);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("removes temporary state when the source stream is interrupted", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-snapshots-"));
  async function* interrupted(): AsyncIterable<Uint8Array> {
    yield Buffer.from("partial");
    throw new Error("read interrupted");
  }

  try {
    const repository = new ContentAddressedSnapshotRepository(root);
    await assert.rejects(repository.store(interrupted()), /read interrupted/);
    assert.deepEqual(await readdir(join(root, ".tmp")), []);
    assert.deepEqual(
      (await readdir(root)).filter((entry) => entry !== ".tmp"),
      [],
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

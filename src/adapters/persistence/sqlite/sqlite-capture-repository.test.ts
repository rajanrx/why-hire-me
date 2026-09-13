import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  createCompletedCapture,
  createFailedCapture,
  snapshotIdFromDigest,
} from "../../../domains/evidence-acquisition/domain/capture-record.js";
import { createPersonProfile } from "../../../domains/person-knowledge/domain/person-profile.js";
import { ContentAddressedSnapshotRepository } from "../../snapshots/content-addressed-snapshot-repository.js";
import { SqliteCaptureRepository } from "./sqlite-capture-repository.js";
import { SqlitePersonProfileRepository } from "./sqlite-person-profile-repository.js";

const connector = Object.freeze({
  id: "local-file",
  version: "1.0.0",
  configurationFingerprint: "default",
});

const provenance = Object.freeze({
  knowledgeSpaceId: "profile-1",
  actorId: "local-user",
  purpose: "build-person-knowledge",
  permissionScope: "file:./resume.pdf",
  idempotencyKey: "request-1",
  correlationId: "correlation-1",
});

async function* content(value: string): AsyncIterable<Uint8Array> {
  yield Buffer.from(value);
}

test("round-trips provenance and resolves one stable source identity", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-capture-"));
  const databasePath = join(root, "knowledge.db");
  const snapshots = new ContentAddressedSnapshotRepository(join(root, "snapshots"));
  const profiles = new SqlitePersonProfileRepository(databasePath);
  const captures = new SqliteCaptureRepository(databasePath, snapshots);
  const profile = createPersonProfile({
    id: "profile-1",
    displayName: "Ada Lovelace",
    createdAt: new Date("2026-09-13T00:00:00.000Z"),
  });

  try {
    await profiles.save(profile);
    const sourceId = await captures.resolveSource({
      proposedId: "source-1",
      profileId: profile.id,
      resolvedLocator: "/work/resume.pdf",
      connector,
    });
    const retrySourceId = await captures.resolveSource({
      proposedId: "source-2",
      profileId: profile.id,
      resolvedLocator: "/work/resume.pdf",
      connector,
    });
    const snapshot = await snapshots.store(content("resume"));
    const capture = createCompletedCapture({
      id: "capture-1",
      profileId: profile.id,
      ...provenance,
      sourceId,
      requestedLocator: "./resume.pdf",
      resolvedLocator: "/work/resume.pdf",
      connector,
      capturedAt: new Date("2026-09-13T01:02:03.000Z"),
      snapshot,
    });

    await captures.record(capture);
    assert.equal(retrySourceId, sourceId);
    assert.deepEqual(await captures.findById(capture.id), capture);
  } finally {
    captures.close();
    profiles.close();
    await rm(root, { recursive: true, force: true });
  }
});

test("records an explicit failed capture", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-capture-"));
  const databasePath = join(root, "knowledge.db");
  const snapshots = new ContentAddressedSnapshotRepository(join(root, "snapshots"));
  const profiles = new SqlitePersonProfileRepository(databasePath);
  const captures = new SqliteCaptureRepository(databasePath, snapshots);
  const profile = createPersonProfile({ id: "profile-1", displayName: "Ada", createdAt: new Date() });

  try {
    await profiles.save(profile);
    const capture = createFailedCapture({
      id: "capture-failed",
      profileId: profile.id,
      ...provenance,
      requestedLocator: "./missing.pdf",
      connector,
      capturedAt: new Date("2026-09-13T01:02:03.000Z"),
      errorCode: "SOURCE_NOT_FOUND",
      diagnostic: "The selected file does not exist.",
    });
    await captures.record(capture);
    assert.deepEqual(await captures.findById(capture.id), capture);
  } finally {
    captures.close();
    profiles.close();
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects completed metadata when snapshot bytes are absent", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-capture-"));
  const databasePath = join(root, "knowledge.db");
  const snapshots = new ContentAddressedSnapshotRepository(join(root, "snapshots"));
  const profiles = new SqlitePersonProfileRepository(databasePath);
  const captures = new SqliteCaptureRepository(databasePath, snapshots);
  const profile = createPersonProfile({ id: "profile-1", displayName: "Ada", createdAt: new Date() });
  const digest = "d".repeat(64);

  try {
    await profiles.save(profile);
    const sourceId = await captures.resolveSource({
      proposedId: "source-1",
      profileId: profile.id,
      resolvedLocator: "/work/resume.pdf",
      connector,
    });
    const capture = createCompletedCapture({
      id: "capture-missing",
      profileId: profile.id,
      ...provenance,
      sourceId,
      requestedLocator: "./resume.pdf",
      resolvedLocator: "/work/resume.pdf",
      connector,
      capturedAt: new Date(),
      snapshot: {
        id: snapshotIdFromDigest(digest),
        algorithm: "sha256",
        digest,
        byteLength: 10,
        storageKey: `sha256/dd/${digest}`,
      },
    });

    await assert.rejects(captures.record(capture), /not available/);
    assert.equal(await captures.findById(capture.id), undefined);
  } finally {
    captures.close();
    profiles.close();
    await rm(root, { recursive: true, force: true });
  }
});

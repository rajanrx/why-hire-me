import assert from "node:assert/strict";
import test from "node:test";

import {
  createCompletedCapture,
  createFailedCapture,
  snapshotIdFromDigest,
} from "./capture-record.js";

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

test("completed capture preserves provenance and snapshot identity", () => {
  const digest = "a".repeat(64);
  const capture = createCompletedCapture({
    id: "capture-1",
    profileId: "profile-1",
    ...provenance,
    sourceId: "source-1",
    requestedLocator: "./resume.pdf",
    resolvedLocator: "/work/resume.pdf",
    connector,
    capturedAt: new Date("2026-09-13T01:02:03.000Z"),
    snapshot: {
      id: snapshotIdFromDigest(digest),
      algorithm: "sha256",
      digest,
      byteLength: 42,
      storageKey: `sha256/aa/${digest}`,
    },
  });

  assert.equal(capture.outcome, "completed");
  assert.equal(capture.snapshot.id, `sha256:${digest}`);
  assert.equal(capture.requestedLocator, "./resume.pdf");
  assert.equal(capture.resolvedLocator, "/work/resume.pdf");
  assert.equal(capture.actorId, "local-user");
  assert.equal(capture.permissionScope, "file:./resume.pdf");
  assert.equal(Object.isFrozen(capture), true);
});

test("same digest has the same logical snapshot identity", () => {
  const digest = "b".repeat(64);
  assert.equal(snapshotIdFromDigest(digest), snapshotIdFromDigest(digest));
  assert.notEqual(snapshotIdFromDigest(digest), snapshotIdFromDigest("c".repeat(64)));
});

test("failed capture records explicit diagnostics without a snapshot", () => {
  const capture = createFailedCapture({
    id: "capture-2",
    profileId: "profile-1",
    ...provenance,
    requestedLocator: "./missing.pdf",
    connector,
    capturedAt: new Date("2026-09-13T01:02:03.000Z"),
    errorCode: "SOURCE_NOT_FOUND",
    diagnostic: "The selected file does not exist.",
  });

  assert.equal(capture.outcome, "failed");
  assert.equal(capture.errorCode, "SOURCE_NOT_FOUND");
  assert.equal("snapshot" in capture, false);
});

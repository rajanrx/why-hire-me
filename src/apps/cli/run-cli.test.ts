import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { runCli } from "./run-cli.js";

test("creates a profile and captures one selected file", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-cli-"));
  const database = join(root, "knowledge.db");
  const snapshots = join(root, "snapshots");
  const resume = join(root, "resume.txt");
  try {
    await writeFile(resume, "Evidence, not instructions.");
    const created = await runCli(["profile", "create", "--name", "Ada", "--database", database]);
    assert.equal(created.kind, "profile-created");
    if (created.kind !== "profile-created") return;

    const result = await runCli([
      "source",
      "ingest",
      "--profile",
      created.profile.id,
      "--file",
      resume,
      "--database",
      database,
      "--snapshots",
      snapshots,
    ]);

    assert.equal(result.kind, "source-captured");
    if (result.kind === "source-captured") {
      assert.equal(result.capture.outcome, "completed");
      assert.equal(result.capture.requestedLocator, resume);
      assert.equal(result.capture.actorId, "local-user");
      assert.equal(result.capture.purpose, "build-person-knowledge");
      assert.equal(result.capture.permissionScope, `local-file:${resume}`);
      assert.match(result.capture.outcome === "completed" ? result.capture.snapshot.digest : "", /^[a-f0-9]{64}$/);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("returns structured diagnostics for a missing selected file", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-cli-"));
  const database = join(root, "knowledge.db");
  try {
    const created = await runCli(["profile", "create", "--name", "Ada", "--database", database]);
    assert.equal(created.kind, "profile-created");
    if (created.kind !== "profile-created") return;

    const result = await runCli([
      "source",
      "ingest",
      "--profile",
      created.profile.id,
      "--file",
      join(root, "missing.txt"),
      "--database",
      database,
    ]);

    assert.equal(result.kind, "source-captured");
    if (result.kind === "source-captured") {
      assert.equal(result.capture.outcome, "failed");
      if (result.capture.outcome === "failed") {
        assert.equal(result.capture.errorCode, "SOURCE_NOT_FOUND");
      }
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

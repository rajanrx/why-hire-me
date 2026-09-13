import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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

test("runs the governed source-to-offline-portfolio journey", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-cli-"));
  const database = join(root, "knowledge.db");
  const resume = join(root, "resume.txt");
  try {
    await writeFile(resume, "Built an accessible career evidence platform.\n");
    const created = await runCli(["profile", "create", "--name", "Ada", "--database", database]);
    assert.equal(created.kind, "profile-created");
    if (created.kind !== "profile-created") return;
    const profile = created.profile.id;
    const captured = await runCli(["source", "ingest", "--profile", profile, "--file", resume,
      "--database", database, "--snapshots", join(root, "snapshots")]);
    assert.equal(captured.kind, "source-captured");
    if (captured.kind !== "source-captured" || captured.capture.outcome !== "completed") return;
    const extracted = await runCli(["evidence", "extract-text", "--profile", profile,
      "--capture", captured.capture.id, "--database", database, "--snapshots", join(root, "snapshots"),
      "--derived", join(root, "derived")]);
    assert.equal(extracted.kind, "text-extracted");
    if (extracted.kind !== "text-extracted" || extracted.extraction.outcome !== "completed") return;
    const staged = await runCli(["knowledge", "stage-entity", "--profile", profile, "--type", "Work",
      "--name", "Career evidence platform", "--artifact", extracted.extraction.artifact.id, "--lines", "1:1",
      "--generator-type", "human", "--generator", "local-user", "--generator-version", "1",
      "--uncertainty", "low", "--uncertainty-rationale", "Stated in selected evidence",
      "--review", "person-required", "--policy", "shareable", "--actor", "local-user",
      "--correlation-id", "trace-portfolio", "--database", database, "--derived", join(root, "derived")]);
    assert.equal(staged.kind, "entity-candidate-staged");
    if (staged.kind !== "entity-candidate-staged") return;
    const reviewed = await runCli(["knowledge", "review-entity", "--profile", profile,
      "--candidate", staged.candidate.id, "--decision", "accepted", "--reason", "I confirm this work",
      "--reviewer", "local-user", "--reviewer-authority", "person", "--correlation-id", "trace-portfolio",
      "--idempotency-key", "review-portfolio", "--database", database]);
    assert.equal(reviewed.kind, "entity-candidate-reviewed");
    const view = await runCli(["knowledge", "create-view", "--profile", profile,
      "--purpose", "career portfolio", "--audience", "private", "--audience-description", "local review",
      "--allow-policy", "shareable", "--expires-at", "2099-01-01T00:00:00.000Z", "--reviewer", "local-user",
      "--idempotency-key", "view-portfolio", "--confirm", "--database", database]);
    assert.equal(view.kind, "authorised-view-created");
    if (view.kind !== "authorised-view-created") return;
    assert.equal(view.view.records.filter((record) => record.recordType === "Entity").length, 1);
    const released = await runCli(["release", "create", "--profile", profile, "--view", view.view.id,
      "--database", database, "--releases", join(root, "releases")]);
    assert.equal(released.kind, "knowledge-release-created");
    if (released.kind !== "knowledge-release-created") return;
    const validation = await runCli(["release", "validate", "--path", released.directory, "--database", database]);
    assert.equal(validation.kind, "knowledge-release-validated");
    if (validation.kind === "knowledge-release-validated") assert.equal(validation.validation.valid, true);
    const portfolio = await runCli(["portfolio", "build", "--release", released.directory,
      "--database", database, "--portfolios", join(root, "portfolios")]);
    assert.equal(portfolio.kind, "career-portfolio-created");
    if (portfolio.kind === "career-portfolio-created") {
      assert.equal(portfolio.manifest.releaseId, released.manifest.releaseId);
      assert.match(await readFile(join(portfolio.directory, "index.html"), "utf8"), /Career evidence platform/);
    }
  } finally { await rm(root, { recursive: true, force: true }); }
});

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { ContentAddressedSnapshotRepository } from "../../../adapters/snapshots/content-addressed-snapshot-repository.js";
import type {
  CaptureId,
  CaptureRecord,
  SourceId,
} from "../domain/capture-record.js";
import type {
  CaptureRepository,
  SourceIdentityInput,
} from "../ports/capture-repository.js";
import { SourceReadError, type SourceReader } from "../ports/source-reader.js";
import type { PersonProfile } from "../../person-knowledge/domain/person-profile.js";
import { createPersonProfile } from "../../person-knowledge/domain/person-profile.js";
import type { KnowledgeSpaceResolver } from "../ports/knowledge-space-resolver.js";
import { CaptureSource, UnknownPersonProfileError } from "./capture-source.js";

class MemoryProfiles implements KnowledgeSpaceResolver {
  public constructor(private readonly profile: PersonProfile) {}
  public async exists(id: string): Promise<boolean> {
    return id === this.profile.id;
  }
}

class MemoryCaptures implements CaptureRepository {
  public readonly records: CaptureRecord[] = [];
  private readonly sources = new Map<string, SourceId>();

  public async resolveSource(input: SourceIdentityInput): Promise<SourceId> {
    const key = [
      input.profileId,
      input.resolvedLocator,
      input.connector.id,
      input.connector.version,
      input.connector.configurationFingerprint,
    ].join("|");
    const existing = this.sources.get(key);
    if (existing !== undefined) return existing;
    const created = input.proposedId as SourceId;
    this.sources.set(key, created);
    return created;
  }

  public async record(capture: CaptureRecord): Promise<void> {
    this.records.push(capture);
  }

  public async findById(id: CaptureId): Promise<CaptureRecord | undefined> {
    return this.records.find((capture) => capture.id === id);
  }
}

class MutableReader implements SourceReader {
  public readonly connector = Object.freeze({
    id: "test-file",
    version: "1.0.0",
    configurationFingerprint: "test",
  });
  public value = "resume-v1";

  public async read(requestedLocator: string) {
    const value = this.value;
    return {
      requestedLocator,
      resolvedLocator: "/resolved/resume.txt",
      bytes: (async function* () {
        yield Buffer.from(value);
      })(),
    };
  }
}

function sequenceIds(...values: string[]) {
  let index = 0;
  return {
    generate: () => {
      const value = values[index];
      index += 1;
      if (value === undefined) throw new Error("No test ID available");
      return value;
    },
  };
}

function captureRequest(profileId: string, requestedLocator: string) {
  return {
    profileId,
    requestedLocator,
    actorId: "local-user",
    purpose: "build-person-knowledge",
    permissionScope: `file:${requestedLocator}`,
    idempotencyKey: `request:${requestedLocator}`,
    correlationId: "correlation-1",
  };
}

test("unchanged retries reuse source and snapshot while changed bytes create a revision", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-capture-app-"));
  const profile = createPersonProfile({ id: "profile-1", displayName: "Ada", createdAt: new Date() });
  const reader = new MutableReader();
  const captures = new MemoryCaptures();
  const useCase = new CaptureSource(
    new MemoryProfiles(profile),
    reader,
    new ContentAddressedSnapshotRepository(root),
    captures,
    sequenceIds("capture-1", "source-1", "capture-2", "source-2", "capture-3", "source-3"),
    { now: () => new Date("2026-09-13T01:02:03.000Z") },
  );

  try {
    const first = await useCase.execute(captureRequest(profile.id, "./resume.txt"));
    const retry = await useCase.execute(captureRequest(profile.id, "./resume.txt"));
    reader.value = "resume-v2";
    const changed = await useCase.execute(captureRequest(profile.id, "./resume.txt"));

    assert.equal(first.outcome, "completed");
    assert.equal(retry.outcome, "completed");
    assert.equal(changed.outcome, "completed");
    if (first.outcome === "completed" && retry.outcome === "completed" && changed.outcome === "completed") {
      assert.equal(retry.sourceId, first.sourceId);
      assert.equal(retry.snapshot.id, first.snapshot.id);
      assert.equal(changed.sourceId, first.sourceId);
      assert.notEqual(changed.snapshot.id, first.snapshot.id);
      assert.equal(first.requestedLocator, "./resume.txt");
      assert.equal(first.resolvedLocator, "/resolved/resume.txt");
    }
    assert.equal(captures.records.length, 3);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("records an explicit source failure", async () => {
  const profile = createPersonProfile({ id: "profile-1", displayName: "Ada", createdAt: new Date() });
  const captures = new MemoryCaptures();
  const reader: SourceReader = {
    connector: { id: "test-file", version: "1.0.0", configurationFingerprint: "test" },
    read: async () => {
      throw new SourceReadError("SOURCE_NOT_FOUND", "The selected file does not exist.");
    },
  };
  const useCase = new CaptureSource(
    new MemoryProfiles(profile),
    reader,
    { store: async () => assert.fail("snapshot store must not run"), contains: async () => false },
    captures,
    sequenceIds("capture-failed"),
    { now: () => new Date("2026-09-13T01:02:03.000Z") },
  );

  const result = await useCase.execute(captureRequest(profile.id, "./missing.txt"));
  assert.equal(result.outcome, "failed");
  if (result.outcome === "failed") assert.equal(result.errorCode, "SOURCE_NOT_FOUND");
  assert.deepEqual(captures.records, [result]);
});

test("rejects an unknown profile before reading the source", async () => {
  const profile = createPersonProfile({ id: "profile-1", displayName: "Ada", createdAt: new Date() });
  const reader = new MutableReader();
  const originalRead = reader.read.bind(reader);
  let read = false;
  reader.read = async (locator: string) => {
    read = true;
    return originalRead(locator);
  };
  const useCase = new CaptureSource(
    new MemoryProfiles(profile),
    reader,
    { store: async () => assert.fail("snapshot store must not run"), contains: async () => false },
    new MemoryCaptures(),
    sequenceIds("unused"),
    { now: () => new Date() },
  );

  await assert.rejects(
    useCase.execute(captureRequest("missing", "./resume.txt")),
    UnknownPersonProfileError,
  );
  assert.equal(read, false);
});

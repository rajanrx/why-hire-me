import assert from "node:assert/strict";
import test from "node:test";

import { createPersonProfile } from "../../../domains/person-knowledge/domain/person-profile.js";
import { SqlitePersonProfileRepository } from "./sqlite-person-profile-repository.js";

test("round-trips a person profile through SQLite", async () => {
  const repository = new SqlitePersonProfileRepository(":memory:");
  const profile = createPersonProfile({
    id: "profile-1",
    displayName: "Katherine Johnson",
    createdAt: new Date("2026-09-13T00:00:00.000Z"),
  });

  try {
    await repository.save(profile);
    assert.deepEqual(await repository.findById(profile.id), profile);
  } finally {
    repository.close();
  }
});

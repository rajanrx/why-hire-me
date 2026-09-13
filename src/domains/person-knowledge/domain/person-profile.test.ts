import assert from "node:assert/strict";
import test from "node:test";

import { createPersonProfile, InvalidPersonProfileError } from "./person-profile.js";

test("creates an immutable, normalised person profile", () => {
  const profile = createPersonProfile({
    id: "profile-1",
    displayName: "  Ada Lovelace  ",
    createdAt: new Date("2026-09-13T00:00:00.000Z"),
  });

  assert.equal(profile.displayName, "Ada Lovelace");
  assert.equal(profile.version, 1);
  assert.equal(Object.isFrozen(profile), true);
});

test("rejects an empty display name", () => {
  assert.throws(
    () =>
      createPersonProfile({
        id: "profile-1",
        displayName: "  ",
        createdAt: new Date(),
      }),
    InvalidPersonProfileError,
  );
});

import assert from "node:assert/strict";
import test from "node:test";

import type { PersonProfile, PersonProfileId } from "../domain/person-profile.js";
import type { PersonProfileRepository } from "../ports/person-profile-repository.js";
import { CreatePersonProfile } from "./create-person-profile.js";

class RecordingRepository implements PersonProfileRepository {
  public saved: PersonProfile | undefined;

  public async save(profile: PersonProfile): Promise<void> {
    this.saved = profile;
  }

  public async findById(_id: PersonProfileId): Promise<PersonProfile | undefined> {
    return undefined;
  }
}

test("creates and persists a profile through the repository port", async () => {
  const repository = new RecordingRepository();
  const useCase = new CreatePersonProfile(
    repository,
    { generate: () => "profile-1" },
    { now: () => new Date("2026-09-13T01:02:03.000Z") },
  );

  const profile = await useCase.execute({ displayName: "Grace Hopper" });

  assert.deepEqual(repository.saved, profile);
  assert.equal(profile.id, "profile-1");
  assert.equal(profile.createdAt, "2026-09-13T01:02:03.000Z");
});

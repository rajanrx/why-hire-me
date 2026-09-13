import type { PersonProfile, PersonProfileId } from "../domain/person-profile.js";

export interface PersonProfileRepository {
  save(profile: PersonProfile): Promise<void>;
  findById(id: PersonProfileId): Promise<PersonProfile | undefined>;
}

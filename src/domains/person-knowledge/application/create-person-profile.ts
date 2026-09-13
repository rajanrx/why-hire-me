import {
  createPersonProfile,
  type PersonProfile,
} from "../domain/person-profile.js";
import type { PersonProfileRepository } from "../ports/person-profile-repository.js";

export interface Clock {
  now(): Date;
}

export interface IdGenerator {
  generate(): string;
}

export interface CreatePersonProfileRequest {
  readonly displayName: string;
}

export class CreatePersonProfile {
  public constructor(
    private readonly profiles: PersonProfileRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  public async execute(request: CreatePersonProfileRequest): Promise<PersonProfile> {
    const profile = createPersonProfile({
      id: this.ids.generate(),
      displayName: request.displayName,
      createdAt: this.clock.now(),
    });

    await this.profiles.save(profile);
    return profile;
  }
}

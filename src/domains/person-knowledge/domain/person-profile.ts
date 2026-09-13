export type PersonProfileId = string & { readonly personProfileId: unique symbol };

export interface PersonProfile {
  readonly id: PersonProfileId;
  readonly displayName: string;
  readonly createdAt: string;
  readonly version: 1;
}

export interface CreatePersonProfileInput {
  readonly id: string;
  readonly displayName: string;
  readonly createdAt: Date;
}

export class InvalidPersonProfileError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "InvalidPersonProfileError";
  }
}

export function createPersonProfile(input: CreatePersonProfileInput): PersonProfile {
  const id = input.id.trim();
  const displayName = input.displayName.trim();

  if (id.length === 0) {
    throw new InvalidPersonProfileError("Profile ID must not be empty.");
  }

  if (displayName.length === 0) {
    throw new InvalidPersonProfileError("Display name must not be empty.");
  }

  if (Number.isNaN(input.createdAt.getTime())) {
    throw new InvalidPersonProfileError("Creation time must be valid.");
  }

  return Object.freeze({
    id: id as PersonProfileId,
    displayName,
    createdAt: input.createdAt.toISOString(),
    version: 1,
  });
}

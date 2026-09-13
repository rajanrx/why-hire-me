import Database from "better-sqlite3";

import type { PersonProfile, PersonProfileId } from "../../../domains/person-knowledge/domain/person-profile.js";
import type { PersonProfileRepository } from "../../../domains/person-knowledge/ports/person-profile-repository.js";

interface PersonProfileRow {
  readonly id: string;
  readonly display_name: string;
  readonly created_at: string;
  readonly version: number;
}

export class SqlitePersonProfileRepository implements PersonProfileRepository {
  private readonly database: Database.Database;

  public constructor(path: string) {
    this.database = new Database(path);
    this.database.pragma("foreign_keys = ON");
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS person_profiles (
        id TEXT PRIMARY KEY,
        display_name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        version INTEGER NOT NULL CHECK (version = 1)
      ) STRICT
    `);
  }

  public async save(profile: PersonProfile): Promise<void> {
    this.database
      .prepare(
        `INSERT INTO person_profiles (id, display_name, created_at, version)
         VALUES (@id, @displayName, @createdAt, @version)`,
      )
      .run(profile);
  }

  public async findById(id: PersonProfileId): Promise<PersonProfile | undefined> {
    const row = this.database
      .prepare("SELECT id, display_name, created_at, version FROM person_profiles WHERE id = ?")
      .get(id) as PersonProfileRow | undefined;

    if (row === undefined) {
      return undefined;
    }

    if (row.version !== 1) {
      throw new Error(`Unsupported person profile version: ${row.version}`);
    }

    return Object.freeze({
      id: row.id as PersonProfileId,
      displayName: row.display_name,
      createdAt: row.created_at,
      version: 1,
    });
  }

  public close(): void {
    this.database.close();
  }
}

import Database from "better-sqlite3";

import type { AuthorisedKnowledgeView } from "../../../domains/person-knowledge/domain/authorised-view.js";
import type { AdmissionActivity, CanonicalEntity } from "../../../domains/person-knowledge/domain/entity-admission.js";
import type {
  AcceptedKnowledgeReader,
  AcceptedKnowledgeSnapshot,
  AuthorisedViewRepository,
} from "../../../domains/person-knowledge/ports/authorised-view-ports.js";

interface JsonRow { readonly value: string }

export class SqliteAuthorisedViewRepository implements AcceptedKnowledgeReader, AuthorisedViewRepository {
  private readonly db: Database.Database;

  public constructor(path: string) {
    this.db = new Database(path);
    this.db.pragma("foreign_keys = ON");
    this.db.pragma("journal_mode = WAL");
    this.db.exec(`CREATE TABLE IF NOT EXISTS disclosure_grants (
      id TEXT PRIMARY KEY,
      knowledge_space_id TEXT NOT NULL REFERENCES person_profiles(id),
      expires_at TEXT NOT NULL,
      grant_json TEXT NOT NULL
    ) STRICT;
    CREATE TABLE IF NOT EXISTS authorised_views (
      id TEXT PRIMARY KEY,
      knowledge_space_id TEXT NOT NULL REFERENCES person_profiles(id),
      version INTEGER NOT NULL,
      grant_id TEXT NOT NULL REFERENCES disclosure_grants(id),
      idempotency_key TEXT NOT NULL,
      request_fingerprint TEXT NOT NULL,
      view_json TEXT NOT NULL,
      UNIQUE(knowledge_space_id, version),
      UNIQUE(knowledge_space_id, idempotency_key)
    ) STRICT;`);
  }

  public async readAccepted(knowledgeSpaceId: string): Promise<AcceptedKnowledgeSnapshot | undefined> {
    const profile = this.db.prepare("SELECT display_name AS value FROM person_profiles WHERE id=?")
      .get(knowledgeSpaceId) as JsonRow | undefined;
    if (profile === undefined) return undefined;
    const entityRows = this.db.prepare(
      "SELECT entity_json AS value FROM canonical_entities WHERE knowledge_space_id=? ORDER BY id",
    ).all(knowledgeSpaceId) as JsonRow[];
    const activityRows = this.db.prepare(
      "SELECT activity_json AS value FROM admission_activities WHERE knowledge_space_id=? AND outcome='accepted' ORDER BY id",
    ).all(knowledgeSpaceId) as JsonRow[];
    return Object.freeze({
      subject: Object.freeze({ displayName: profile.value }),
      entities: Object.freeze(entityRows.map((row) => JSON.parse(row.value) as CanonicalEntity)),
      activities: Object.freeze(activityRows.map((row) => JSON.parse(row.value) as AdmissionActivity)),
    });
  }

  public async findByIdempotencyKey(knowledgeSpaceId: string, idempotencyKey: string): Promise<AuthorisedKnowledgeView | undefined> {
    const row = this.db.prepare(
      "SELECT view_json AS value FROM authorised_views WHERE knowledge_space_id=? AND idempotency_key=?",
    ).get(knowledgeSpaceId, idempotencyKey) as JsonRow | undefined;
    return row === undefined ? undefined : JSON.parse(row.value) as AuthorisedKnowledgeView;
  }

  public async findById(viewId: string, knowledgeSpaceId: string): Promise<AuthorisedKnowledgeView | undefined> {
    const row = this.db.prepare(
      "SELECT view_json AS value FROM authorised_views WHERE id=? AND knowledge_space_id=?",
    ).get(viewId, knowledgeSpaceId) as JsonRow | undefined;
    return row === undefined ? undefined : JSON.parse(row.value) as AuthorisedKnowledgeView;
  }

  public async nextVersion(knowledgeSpaceId: string): Promise<number> {
    const row = this.db.prepare(
      "SELECT COALESCE(MAX(version),0)+1 AS value FROM authorised_views WHERE knowledge_space_id=?",
    ).get(knowledgeSpaceId) as { readonly value: number };
    return row.value;
  }

  public async save(view: AuthorisedKnowledgeView): Promise<void> {
    this.db.transaction(() => {
      this.db.prepare("INSERT INTO disclosure_grants VALUES (?,?,?,?)").run(
        view.grant.id, view.knowledgeSpaceId, view.expiresAt, JSON.stringify(view.grant),
      );
      this.db.prepare("INSERT INTO authorised_views VALUES (?,?,?,?,?,?,?)").run(
        view.id, view.knowledgeSpaceId, view.version, view.grant.id, view.idempotencyKey,
        view.requestFingerprint, JSON.stringify(view),
      );
    })();
  }

  public close(): void { this.db.close(); }
}

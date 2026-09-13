import Database from "better-sqlite3";

import type {
  AdmissionActivity,
  AdmissionDecision,
  AdmissionResult,
  CanonicalEntity,
  CanonicalEntityType,
  EntityProposal,
} from "../../../domains/person-knowledge/domain/entity-admission.js";
import { EntityAdmissionConflictError } from "../../../domains/person-knowledge/domain/entity-admission.js";
import type {
  EntityAdmissionRepository,
  EntityProposalReader,
} from "../../../domains/person-knowledge/ports/entity-admission-ports.js";

interface CandidateRow {
  candidate_json: string;
}

interface CandidateJson {
  schemaVersion: "0.1";
  id: string;
  knowledgeSpaceId: string;
  entityType: CanonicalEntityType;
  proposedName: string;
  evidence: readonly unknown[];
  generator: { readonly id: string; readonly type: "human" | "model" | "skill" | "import" };
  possibleDuplicateIds: readonly string[];
  conflictCandidateIds: readonly string[];
  reviewRequirement: "person-required" | "policy-required";
  policyLabels: readonly string[];
}

interface DecisionRow {
  decision_json: string;
  activity_json: string;
  entity_json: string | null;
}

function resultFromRow(row: DecisionRow, reused: boolean): AdmissionResult {
  const decision = JSON.parse(row.decision_json) as AdmissionDecision;
  const activity = JSON.parse(row.activity_json) as AdmissionActivity;
  const entity = row.entity_json === null ? undefined : JSON.parse(row.entity_json) as CanonicalEntity;
  return Object.freeze({ decision, activity, ...(entity ? { entity } : {}), reused });
}

export class SqliteEntityAdmissionRepository implements EntityProposalReader, EntityAdmissionRepository {
  private readonly db: Database.Database;

  public constructor(path: string) {
    this.db = new Database(path);
    this.db.pragma("foreign_keys = ON");
    this.db.pragma("journal_mode = WAL");
    this.db.exec(`CREATE TABLE IF NOT EXISTS entity_candidates (
      id TEXT PRIMARY KEY,
      schema_version TEXT NOT NULL,
      knowledge_space_id TEXT NOT NULL REFERENCES person_profiles(id),
      status TEXT NOT NULL CHECK(status='proposed'),
      entity_type TEXT NOT NULL,
      proposed_name TEXT NOT NULL,
      candidate_json TEXT NOT NULL
    ) STRICT;
    CREATE TABLE IF NOT EXISTS canonical_entities (
      id TEXT PRIMARY KEY,
      knowledge_space_id TEXT NOT NULL REFERENCES person_profiles(id),
      entity_type TEXT NOT NULL,
      generated_by TEXT NOT NULL,
      entity_json TEXT NOT NULL
    ) STRICT;
    CREATE TABLE IF NOT EXISTS admission_activities (
      id TEXT PRIMARY KEY,
      knowledge_space_id TEXT NOT NULL REFERENCES person_profiles(id),
      candidate_id TEXT NOT NULL REFERENCES entity_candidates(id),
      outcome TEXT NOT NULL CHECK(outcome IN ('accepted','rejected','deferred')),
      activity_json TEXT NOT NULL
    ) STRICT;
    CREATE TABLE IF NOT EXISTS entity_admission_decisions (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL REFERENCES entity_candidates(id),
      knowledge_space_id TEXT NOT NULL REFERENCES person_profiles(id),
      disposition TEXT NOT NULL CHECK(disposition IN ('accepted','rejected','deferred')),
      idempotency_key TEXT NOT NULL,
      activity_id TEXT NOT NULL REFERENCES admission_activities(id),
      admitted_entity_id TEXT REFERENCES canonical_entities(id),
      decision_json TEXT NOT NULL,
      UNIQUE(knowledge_space_id,idempotency_key)
    ) STRICT;
    CREATE UNIQUE INDEX IF NOT EXISTS one_terminal_entity_admission
      ON entity_admission_decisions(candidate_id)
      WHERE disposition IN ('accepted','rejected');`);
  }

  public async find(candidateId: string, knowledgeSpaceId: string): Promise<EntityProposal | undefined> {
    const row = this.db.prepare(
      "SELECT candidate_json FROM entity_candidates WHERE id=? AND knowledge_space_id=?",
    ).get(candidateId, knowledgeSpaceId) as CandidateRow | undefined;
    if (row === undefined) return undefined;

    const candidate = JSON.parse(row.candidate_json) as CandidateJson;
    if (candidate.id !== candidateId || candidate.knowledgeSpaceId !== knowledgeSpaceId) {
      return undefined;
    }
    return Object.freeze({
      candidateId: candidate.id,
      schemaVersion: candidate.schemaVersion,
      knowledgeSpaceId: candidate.knowledgeSpaceId,
      entityType: candidate.entityType,
      proposedName: candidate.proposedName,
      evidenceCount: candidate.evidence.length,
      generatorId: candidate.generator.id,
      generatorType: candidate.generator.type,
      possibleDuplicateIds: Object.freeze([...candidate.possibleDuplicateIds]),
      conflictCandidateIds: Object.freeze([...candidate.conflictCandidateIds]),
      reviewRequirement: candidate.reviewRequirement,
      policyLabels: Object.freeze([...candidate.policyLabels]),
    });
  }

  public async findByIdempotencyKey(
    knowledgeSpaceId: string,
    idempotencyKey: string,
  ): Promise<AdmissionResult | undefined> {
    const row = this.db.prepare(`SELECT d.decision_json,a.activity_json,e.entity_json
      FROM entity_admission_decisions d
      JOIN admission_activities a ON a.id=d.activity_id
      LEFT JOIN canonical_entities e ON e.id=d.admitted_entity_id
      WHERE d.knowledge_space_id=? AND d.idempotency_key=?`).get(
      knowledgeSpaceId,
      idempotencyKey,
    ) as DecisionRow | undefined;
    return row === undefined ? undefined : resultFromRow(row, true);
  }

  public async findTerminalDecision(
    candidateId: string,
    knowledgeSpaceId: string,
  ): Promise<AdmissionDecision | undefined> {
    const row = this.db.prepare(`SELECT decision_json FROM entity_admission_decisions
      WHERE candidate_id=? AND knowledge_space_id=? AND disposition IN ('accepted','rejected')
      LIMIT 1`).get(candidateId, knowledgeSpaceId) as { decision_json: string } | undefined;
    return row === undefined ? undefined : JSON.parse(row.decision_json) as AdmissionDecision;
  }

  public async record(input: {
    readonly decision: AdmissionDecision;
    readonly activity: AdmissionActivity;
    readonly entity?: CanonicalEntity;
  }): Promise<AdmissionResult> {
    try {
      this.db.transaction(() => {
        if (input.entity !== undefined) {
          this.db.prepare("INSERT INTO canonical_entities VALUES (?,?,?,?,?)").run(
            input.entity.id,
            input.entity.knowledgeSpaceId,
            input.entity.data.entityType,
            input.entity.generatedBy,
            JSON.stringify(input.entity),
          );
        }
        this.db.prepare("INSERT INTO admission_activities VALUES (?,?,?,?,?)").run(
          input.activity.id,
          input.activity.knowledgeSpaceId,
          input.decision.candidateId,
          input.decision.disposition,
          JSON.stringify(input.activity),
        );
        this.db.prepare("INSERT INTO entity_admission_decisions VALUES (?,?,?,?,?,?,?,?)").run(
          input.decision.id,
          input.decision.candidateId,
          input.decision.knowledgeSpaceId,
          input.decision.disposition,
          input.decision.idempotencyKey,
          input.activity.id,
          input.entity?.id ?? null,
          JSON.stringify(input.decision),
        );
      })();
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
        throw new EntityAdmissionConflictError("Admission conflicts with an existing decision.");
      }
      throw error;
    }

    return Object.freeze({ ...input, reused: false });
  }

  public close(): void {
    this.db.close();
  }
}

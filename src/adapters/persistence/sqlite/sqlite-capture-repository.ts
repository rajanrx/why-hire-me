import Database from "better-sqlite3";

import {
  createCompletedCapture,
  createFailedCapture,
  type CaptureId,
  type CaptureRecord,
  type SnapshotDescriptor,
  type SourceId,
} from "../../../domains/evidence-acquisition/domain/capture-record.js";
import type {
  CaptureRepository,
  SourceIdentityInput,
} from "../../../domains/evidence-acquisition/ports/capture-repository.js";
import type { SnapshotRepository } from "../../../domains/evidence-acquisition/ports/snapshot-repository.js";

interface SourceRow {
  readonly id: string;
}

interface CaptureRow {
  readonly id: string;
  readonly profile_id: string;
  readonly knowledge_space_id: string;
  readonly actor_id: string;
  readonly purpose: string;
  readonly permission_scope: string;
  readonly idempotency_key: string;
  readonly correlation_id: string;
  readonly source_id: string | null;
  readonly requested_locator: string;
  readonly resolved_locator: string | null;
  readonly connector_id: string;
  readonly connector_version: string;
  readonly configuration_fingerprint: string;
  readonly captured_at: string;
  readonly outcome: "completed" | "failed";
  readonly snapshot_id: string | null;
  readonly algorithm: "sha256" | null;
  readonly digest: string | null;
  readonly byte_length: number | null;
  readonly storage_key: string | null;
  readonly error_code: "SOURCE_NOT_FOUND" | "SOURCE_NOT_REGULAR_FILE" | "SOURCE_NOT_READABLE" | "SNAPSHOT_STORAGE_FAILED" | null;
  readonly diagnostic: string | null;
}

export class SqliteCaptureRepository implements CaptureRepository {
  private readonly database: Database.Database;

  public constructor(
    path: string,
    private readonly snapshots: SnapshotRepository,
  ) {
    this.database = new Database(path);
    this.database.pragma("foreign_keys = ON");
    this.database.pragma("journal_mode = WAL");
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS acquisition_sources (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL REFERENCES person_profiles(id),
        resolved_locator TEXT NOT NULL,
        connector_id TEXT NOT NULL,
        connector_version TEXT NOT NULL,
        configuration_fingerprint TEXT NOT NULL,
        UNIQUE (
          profile_id,
          resolved_locator,
          connector_id,
          connector_version,
          configuration_fingerprint
        )
      ) STRICT;

      CREATE TABLE IF NOT EXISTS evidence_snapshots (
        id TEXT PRIMARY KEY,
        algorithm TEXT NOT NULL CHECK (algorithm = 'sha256'),
        digest TEXT NOT NULL UNIQUE,
        byte_length INTEGER NOT NULL CHECK (byte_length >= 0),
        storage_key TEXT NOT NULL UNIQUE
      ) STRICT;

      CREATE TABLE IF NOT EXISTS capture_runs (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL REFERENCES person_profiles(id),
        knowledge_space_id TEXT NOT NULL,
        actor_id TEXT NOT NULL,
        purpose TEXT NOT NULL,
        permission_scope TEXT NOT NULL,
        idempotency_key TEXT NOT NULL,
        correlation_id TEXT NOT NULL,
        source_id TEXT REFERENCES acquisition_sources(id),
        requested_locator TEXT NOT NULL,
        resolved_locator TEXT,
        connector_id TEXT NOT NULL,
        connector_version TEXT NOT NULL,
        configuration_fingerprint TEXT NOT NULL,
        captured_at TEXT NOT NULL,
        outcome TEXT NOT NULL CHECK (outcome IN ('completed', 'failed')),
        snapshot_id TEXT REFERENCES evidence_snapshots(id),
        error_code TEXT,
        diagnostic TEXT,
        CHECK (
          (outcome = 'completed' AND source_id IS NOT NULL AND resolved_locator IS NOT NULL
            AND snapshot_id IS NOT NULL AND error_code IS NULL AND diagnostic IS NULL)
          OR
          (outcome = 'failed' AND snapshot_id IS NULL AND error_code IS NOT NULL
            AND diagnostic IS NOT NULL)
        )
      ) STRICT;
    `);
  }

  public async resolveSource(input: SourceIdentityInput): Promise<SourceId> {
    this.database
      .prepare(
        `INSERT INTO acquisition_sources (
          id, profile_id, resolved_locator, connector_id, connector_version,
          configuration_fingerprint
        ) VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT (
          profile_id, resolved_locator, connector_id, connector_version,
          configuration_fingerprint
        ) DO NOTHING`,
      )
      .run(
        input.proposedId,
        input.profileId,
        input.resolvedLocator,
        input.connector.id,
        input.connector.version,
        input.connector.configurationFingerprint,
      );

    const source = this.database
      .prepare(
        `SELECT id FROM acquisition_sources
         WHERE profile_id = ? AND resolved_locator = ? AND connector_id = ?
           AND connector_version = ? AND configuration_fingerprint = ?`,
      )
      .get(
        input.profileId,
        input.resolvedLocator,
        input.connector.id,
        input.connector.version,
        input.connector.configurationFingerprint,
      ) as SourceRow | undefined;

    if (source === undefined) {
      throw new Error("Could not resolve source identity.");
    }
    return source.id as SourceId;
  }

  public async record(capture: CaptureRecord): Promise<void> {
    if (capture.outcome === "completed" && !(await this.snapshots.contains(capture.snapshot))) {
      throw new Error(`Snapshot ${capture.snapshot.id} is not available in durable storage.`);
    }

    this.database.transaction(() => {
      if (capture.outcome === "completed") {
        this.insertSnapshot(capture.snapshot);
      }

      this.database
        .prepare(
          `INSERT INTO capture_runs (
            id, profile_id, knowledge_space_id, actor_id, purpose, permission_scope,
            idempotency_key, correlation_id, source_id, requested_locator, resolved_locator,
            connector_id, connector_version, configuration_fingerprint,
            captured_at, outcome, snapshot_id, error_code, diagnostic
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          capture.id,
          capture.profileId,
          capture.knowledgeSpaceId,
          capture.actorId,
          capture.purpose,
          capture.permissionScope,
          capture.idempotencyKey,
          capture.correlationId,
          capture.outcome === "completed" ? capture.sourceId : null,
          capture.requestedLocator,
          capture.resolvedLocator ?? null,
          capture.connector.id,
          capture.connector.version,
          capture.connector.configurationFingerprint,
          capture.capturedAt,
          capture.outcome,
          capture.outcome === "completed" ? capture.snapshot.id : null,
          capture.outcome === "failed" ? capture.errorCode : null,
          capture.outcome === "failed" ? capture.diagnostic : null,
        );
    })();
  }

  public async findById(id: CaptureId): Promise<CaptureRecord | undefined> {
    const row = this.database
      .prepare(
        `SELECT c.*, s.algorithm, s.digest, s.byte_length, s.storage_key
         FROM capture_runs c
         LEFT JOIN evidence_snapshots s ON s.id = c.snapshot_id
         WHERE c.id = ?`,
      )
      .get(id) as CaptureRow | undefined;

    if (row === undefined) {
      return undefined;
    }

    const common = {
      id: row.id,
      profileId: row.profile_id,
      knowledgeSpaceId: row.knowledge_space_id,
      actorId: row.actor_id,
      purpose: row.purpose,
      permissionScope: row.permission_scope,
      idempotencyKey: row.idempotency_key,
      correlationId: row.correlation_id,
      requestedLocator: row.requested_locator,
      connector: {
        id: row.connector_id,
        version: row.connector_version,
        configurationFingerprint: row.configuration_fingerprint,
      },
      capturedAt: new Date(row.captured_at),
    };

    if (row.outcome === "failed") {
      if (row.error_code === null || row.diagnostic === null) {
        throw new Error(`Failed capture ${row.id} has incomplete diagnostics.`);
      }
      return createFailedCapture({
        ...common,
        ...(row.resolved_locator === null ? {} : { resolvedLocator: row.resolved_locator }),
        errorCode: row.error_code,
        diagnostic: row.diagnostic,
      });
    }

    if (
      row.source_id === null ||
      row.resolved_locator === null ||
      row.snapshot_id === null ||
      row.algorithm === null ||
      row.digest === null ||
      row.byte_length === null ||
      row.storage_key === null
    ) {
      throw new Error(`Completed capture ${row.id} has incomplete snapshot metadata.`);
    }

    return createCompletedCapture({
      ...common,
      sourceId: row.source_id,
      resolvedLocator: row.resolved_locator,
      snapshot: {
        id: row.snapshot_id as SnapshotDescriptor["id"],
        algorithm: row.algorithm,
        digest: row.digest,
        byteLength: row.byte_length,
        storageKey: row.storage_key,
      },
    });
  }

  public close(): void {
    this.database.close();
  }

  private insertSnapshot(snapshot: SnapshotDescriptor): void {
    this.database
      .prepare(
        `INSERT INTO evidence_snapshots (id, algorithm, digest, byte_length, storage_key)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (id) DO NOTHING`,
      )
      .run(
        snapshot.id,
        snapshot.algorithm,
        snapshot.digest,
        snapshot.byteLength,
        snapshot.storageKey,
      );

    const stored = this.database
      .prepare(
        `SELECT id, algorithm, digest, byte_length AS byteLength, storage_key AS storageKey
         FROM evidence_snapshots WHERE id = ?`,
      )
      .get(snapshot.id) as
      | {
          readonly id: string;
          readonly algorithm: string;
          readonly digest: string;
          readonly byteLength: number;
          readonly storageKey: string;
        }
      | undefined;

    if (
      stored === undefined ||
      stored.algorithm !== snapshot.algorithm ||
      stored.digest !== snapshot.digest ||
      stored.byteLength !== snapshot.byteLength ||
      stored.storageKey !== snapshot.storageKey
    ) {
      throw new Error(`Stored metadata conflicts with snapshot ${snapshot.id}.`);
    }
  }
}

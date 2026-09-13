import { createHash, randomUUID } from "node:crypto";
import { link, mkdir, open, rm, stat, unlink } from "node:fs/promises";
import { dirname, join, posix } from "node:path";
import Database from "better-sqlite3";
import type { ExtractionAttempt, TextArtifact } from "../../../domains/knowledge-enrichment/domain/text-extraction.js";
import type { TextArtifactRepository } from "../../../domains/knowledge-enrichment/ports/text-extraction-ports.js";

export class LocalTextArtifactRepository implements TextArtifactRepository {
  private readonly db: Database.Database;
  constructor(path: string, private readonly root: string) {
    this.db = new Database(path); this.db.pragma("foreign_keys = ON"); this.db.pragma("journal_mode = WAL");
    this.db.exec(`CREATE TABLE IF NOT EXISTS text_artifacts (
      id TEXT PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES person_profiles(id), capture_id TEXT NOT NULL REFERENCES capture_runs(id),
      snapshot_id TEXT NOT NULL, snapshot_digest TEXT NOT NULL, extractor_id TEXT NOT NULL,
      extractor_version TEXT NOT NULL, configuration_fingerprint TEXT NOT NULL,
      output_digest TEXT NOT NULL, line_count INTEGER NOT NULL, storage_key TEXT NOT NULL UNIQUE,
      UNIQUE(snapshot_id, extractor_id, extractor_version, configuration_fingerprint, output_digest)
    ) STRICT;
    CREATE TABLE IF NOT EXISTS extraction_runs (
      id TEXT PRIMARY KEY, profile_id TEXT NOT NULL, capture_id TEXT NOT NULL, snapshot_id TEXT,
      extractor_id TEXT, extractor_version TEXT, configuration_fingerprint TEXT, extracted_at TEXT NOT NULL,
      outcome TEXT NOT NULL CHECK(outcome IN ('completed','failed')), artifact_id TEXT REFERENCES text_artifacts(id),
      error_code TEXT, diagnostic TEXT,
      CHECK ((outcome='completed' AND artifact_id IS NOT NULL AND error_code IS NULL) OR
             (outcome='failed' AND artifact_id IS NULL AND error_code IS NOT NULL AND diagnostic IS NOT NULL))
    ) STRICT;`);
  }
  async store(input: Omit<TextArtifact, "id"|"outputDigest"|"storageKey"> & {text:string}): Promise<TextArtifact> {
    const outputDigest = createHash("sha256").update(input.text).digest("hex");
    const identity = [input.snapshotId,input.extractor.id,input.extractor.version,input.extractor.configurationFingerprint,outputDigest].join("\n");
    const id = `text:${createHash("sha256").update(identity).digest("hex")}`;
    const storageKey = posix.join("text","sha256",outputDigest.slice(0,2),`${outputDigest}.txt`);
    const target = join(this.root, storageKey); await mkdir(dirname(target), {recursive:true,mode:0o700});
    const tempRoot = join(this.root,".tmp"); await mkdir(tempRoot,{recursive:true,mode:0o700});
    const temp = join(tempRoot,`${randomUUID()}.txt`); const handle = await open(temp,"wx",0o600);
    try { await handle.writeFile(input.text,"utf8"); await handle.sync(); await handle.close();
      try { await link(temp,target); await unlink(temp); } catch (error:unknown) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
        await rm(temp,{force:true});
      }
      const saved = await stat(target); if (!saved.isFile() || saved.size !== Buffer.byteLength(input.text)) throw new Error("Derived text integrity conflict.");
    } catch (error) { await handle.close().catch(()=>undefined); await rm(temp,{force:true}); throw error; }
    const artifact: TextArtifact = Object.freeze({ id, profileId: input.profileId,
      captureId: input.captureId, snapshotId: input.snapshotId, snapshotDigest: input.snapshotDigest,
      extractor: input.extractor, lineCount: input.lineCount, outputDigest, storageKey });
    this.db.prepare(`INSERT INTO text_artifacts VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`).run(
      id,input.profileId,input.captureId,input.snapshotId,input.snapshotDigest,input.extractor.id,input.extractor.version,
      input.extractor.configurationFingerprint,outputDigest,input.lineCount,storageKey);
    return artifact;
  }
  async record(attempt: ExtractionAttempt): Promise<void> {
    this.db.prepare(`INSERT INTO extraction_runs VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      attempt.id,attempt.profileId,attempt.captureId,attempt.snapshotId??null,attempt.extractor?.id??null,
      attempt.extractor?.version??null,attempt.extractor?.configurationFingerprint??null,attempt.extractedAt,
      attempt.outcome,attempt.outcome==="completed"?attempt.artifact.id:null,
      attempt.outcome==="failed"?attempt.errorCode:null,attempt.outcome==="failed"?attempt.diagnostic:null);
  }
  close(): void { this.db.close(); }
}

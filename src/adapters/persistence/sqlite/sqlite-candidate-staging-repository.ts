import { createHash } from "node:crypto";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import Database from "better-sqlite3";
import type { CandidateSubmission, EntityCandidate, EvidenceCitation } from "../../../domains/knowledge-enrichment/domain/entity-candidate.js";
import { CandidateEvidenceUnavailableError, type CandidateEvidenceReader, type CandidateRepository } from "../../../domains/knowledge-enrichment/ports/candidate-staging-ports.js";

interface ArtifactRow {profile_id:string;snapshot_id:string;snapshot_digest:string;line_count:number;storage_key:string}

export class SqliteCandidateStagingRepository implements CandidateEvidenceReader,CandidateRepository {
  private readonly db:Database.Database;
  constructor(path:string,private readonly derivedRoot:string){
    this.db=new Database(path);this.db.pragma("foreign_keys = ON");this.db.pragma("journal_mode = WAL");
    this.db.exec(`CREATE TABLE IF NOT EXISTS entity_candidates (
      id TEXT PRIMARY KEY, schema_version TEXT NOT NULL, knowledge_space_id TEXT NOT NULL REFERENCES person_profiles(id),
      status TEXT NOT NULL CHECK(status='proposed'), entity_type TEXT NOT NULL, proposed_name TEXT NOT NULL,
      candidate_json TEXT NOT NULL
    ) STRICT;
    CREATE TABLE IF NOT EXISTS candidate_evidence (
      candidate_id TEXT NOT NULL REFERENCES entity_candidates(id), artifact_id TEXT NOT NULL REFERENCES text_artifacts(id),
      snapshot_id TEXT NOT NULL, snapshot_digest TEXT NOT NULL, line_start INTEGER NOT NULL, line_end INTEGER NOT NULL,
      relation TEXT NOT NULL, PRIMARY KEY(candidate_id,artifact_id,line_start,line_end,relation)
    ) STRICT;
    CREATE TABLE IF NOT EXISTS candidate_submissions (
      id TEXT PRIMARY KEY, candidate_id TEXT NOT NULL REFERENCES entity_candidates(id), actor_id TEXT NOT NULL,
      correlation_id TEXT NOT NULL, submitted_at TEXT NOT NULL
    ) STRICT;`);
  }
  async resolve(input:{profileId:string;artifactId:string;lineStart:number;lineEnd:number;relation:"supports"|"contextualises"}):Promise<EvidenceCitation>{
    const row=this.db.prepare(`SELECT profile_id,snapshot_id,snapshot_digest,line_count,storage_key FROM text_artifacts WHERE id=? AND profile_id=?`).get(input.artifactId,input.profileId) as ArtifactRow|undefined;
    if(!row||input.lineStart<1||input.lineEnd<input.lineStart||input.lineEnd>row.line_count) throw new CandidateEvidenceUnavailableError();
    try { const file=await stat(join(this.derivedRoot,row.storage_key)); if(!file.isFile()) throw new Error(); } catch { throw new CandidateEvidenceUnavailableError(); }
    return Object.freeze({artifactId:input.artifactId,snapshotId:row.snapshot_id,snapshotDigest:row.snapshot_digest,
      lineStart:input.lineStart,lineEnd:input.lineEnd,relation:input.relation});
  }
  async stage(candidate:Omit<EntityCandidate,"id">,submission:Omit<CandidateSubmission,"candidateId">){
    const payload=JSON.stringify(candidate);const id=`candidate:${createHash("sha256").update(payload).digest("hex")}`;
    const complete=Object.freeze({...candidate,id});
    const existed=this.db.prepare("SELECT 1 FROM entity_candidates WHERE id=?").get(id)!==undefined;
    this.db.transaction(()=>{
      this.db.prepare("INSERT INTO entity_candidates VALUES (?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING").run(id,candidate.schemaVersion,candidate.knowledgeSpaceId,candidate.status,candidate.entityType,candidate.proposedName,JSON.stringify(complete));
      const insert=this.db.prepare("INSERT INTO candidate_evidence VALUES (?,?,?,?,?,?,?) ON CONFLICT DO NOTHING");
      for(const evidence of candidate.evidence) insert.run(id,evidence.artifactId,evidence.snapshotId,evidence.snapshotDigest,evidence.lineStart,evidence.lineEnd,evidence.relation);
      this.db.prepare("INSERT INTO candidate_submissions VALUES (?,?,?,?,?)").run(submission.id,id,submission.actorId,submission.correlationId,submission.submittedAt);
    })();
    return {candidate:complete,submission:Object.freeze({...submission,candidateId:id}),reused:existed};
  }
  close(){this.db.close();}
}

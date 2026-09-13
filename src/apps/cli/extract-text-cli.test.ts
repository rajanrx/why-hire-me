import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import Database from "better-sqlite3";
import { runCli } from "./run-cli.js";

test("captures and extracts citable text with stable artefact identity", async () => {
  const root=await mkdtemp(join(tmpdir(),"why-hire-me-extract-"));
  try {
    const file=join(root,"resume.md"); await writeFile(file,"# Work\r\nBuilt systems");
    const created=await runCli(["profile","create","--name","Rajan"],{WHY_HIRE_ME_HOME:root});
    assert.equal(created.kind,"profile-created"); if(created.kind!=="profile-created") return;
    const captured=await runCli(["source","ingest","--profile",created.profile.id,"--file",file],{WHY_HIRE_ME_HOME:root});
    assert.equal(captured.kind,"source-captured"); if(captured.kind!=="source-captured"||captured.capture.outcome!=="completed") return;
    const args=["evidence","extract-text","--profile",created.profile.id,"--capture",captured.capture.id];
    const first=await runCli(args,{WHY_HIRE_ME_HOME:root}); const retry=await runCli(args,{WHY_HIRE_ME_HOME:root});
    assert.equal(first.kind,"text-extracted"); assert.equal(retry.kind,"text-extracted");
    const artifactId=first.kind==="text-extracted"&&first.extraction.outcome==="completed"?first.extraction.artifact.id:assert.fail("expected completed text artefact");
    if(first.kind==="text-extracted"&&retry.kind==="text-extracted"&&first.extraction.outcome==="completed"&&retry.extraction.outcome==="completed") {
      assert.equal(first.extraction.artifact.id,retry.extraction.artifact.id); assert.equal(first.extraction.artifact.lineCount,2);
      const stageArgs=["knowledge","stage-entity","--profile",created.profile.id,"--type","Work","--name","Built systems",
        "--artifact",artifactId,"--lines","2:2","--generator-type","model","--generator","test-extractor",
        "--generator-version","1.0.0","--model","test/model","--uncertainty","low","--uncertainty-rationale","Explicit line",
        "--review","person-required","--policy","private","--actor","test-agent","--correlation-id","corr-1"];
      const staged=await runCli(stageArgs,{WHY_HIRE_ME_HOME:root});const restaged=await runCli(stageArgs,{WHY_HIRE_ME_HOME:root});
      assert.equal(staged.kind,"entity-candidate-staged");assert.equal(restaged.kind,"entity-candidate-staged");
      if(staged.kind==="entity-candidate-staged"&&restaged.kind==="entity-candidate-staged"){
        assert.equal(staged.candidate.id,restaged.candidate.id);assert.equal(staged.reused,false);assert.equal(restaged.reused,true);
        assert.equal(staged.candidate.evidence[0]?.snapshotId,captured.capture.snapshot.id);
      }
    }
    const database = new Database(join(root,"knowledge.db"), { readonly: true });
    try {
      assert.equal((database.prepare("SELECT count(*) AS count FROM text_artifacts").get() as {count:number}).count,1);
      assert.equal((database.prepare("SELECT count(*) AS count FROM extraction_runs WHERE outcome='completed'").get() as {count:number}).count,2);
      const lineage=database.prepare("SELECT snapshot_id, extractor_id, extractor_version FROM text_artifacts").get() as Record<string,string>;
      assert.equal(lineage.snapshot_id,captured.capture.snapshot.id); assert.equal(lineage.extractor_id,"utf8-text"); assert.equal(lineage.extractor_version,"1.0.0");
      assert.equal((database.prepare("SELECT count(*) AS count FROM entity_candidates").get() as {count:number}).count,1);
      assert.equal((database.prepare("SELECT count(*) AS count FROM candidate_submissions").get() as {count:number}).count,2);
    } finally { database.close(); }
    const other=await runCli(["profile","create","--name","Other"],{WHY_HIRE_ME_HOME:root});
    assert.equal(other.kind,"profile-created");
    if(other.kind==="profile-created") {
      const denied=await runCli(["evidence","extract-text","--profile",other.profile.id,"--capture",captured.capture.id],{WHY_HIRE_ME_HOME:root});
      assert.equal(denied.kind,"text-extracted");
      assert.equal(denied.kind==="text-extracted"&&denied.extraction.outcome==="failed"&&denied.extraction.errorCode,"CAPTURE_UNAVAILABLE");
      assert.equal(denied.kind==="text-extracted"&&denied.extraction.outcome==="failed"&&denied.extraction.snapshotId,undefined);
      await assert.rejects(()=>runCli(["knowledge","stage-entity","--profile",other.profile.id,"--type","Work","--name","Hidden",
        "--artifact",artifactId,"--lines","1:1","--generator-type","human","--generator","local","--generator-version","1",
        "--uncertainty","unknown","--uncertainty-rationale","Review needed","--review","person-required","--policy","private",
        "--actor","local","--correlation-id","denied"],{WHY_HIRE_ME_HOME:root}),/unavailable/);
    }
    const pdf=join(root,"resume.pdf"); await writeFile(pdf,"not interpreted");
    const pdfCapture=await runCli(["source","ingest","--profile",created.profile.id,"--file",pdf],{WHY_HIRE_ME_HOME:root});
    if(pdfCapture.kind==="source-captured"&&pdfCapture.capture.outcome==="completed") {
      const unsupported=await runCli(["evidence","extract-text","--profile",created.profile.id,"--capture",pdfCapture.capture.id],{WHY_HIRE_ME_HOME:root});
      assert.equal(unsupported.kind==="text-extracted"&&unsupported.extraction.outcome==="failed"&&unsupported.extraction.errorCode,"UNSUPPORTED_FORMAT");
    }
  } finally { await rm(root,{recursive:true,force:true}); }
});

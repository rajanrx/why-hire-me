import assert from "node:assert/strict";
import test from "node:test";
import { ExtractEvidenceText } from "./extract-evidence-text.js";
import { Utf8TextExtractor } from "../../../adapters/extractors/utf8-text-extractor.js";
import type { ExtractionAttempt, TextArtifact } from "../domain/text-extraction.js";
import { EvidenceReadError } from "../ports/text-extraction-ports.js";

async function* content() { yield Buffer.from("hello\r\nworld"); }

test("orchestrates a completed extraction without admitting knowledge", async () => {
  const attempts: ExtractionAttempt[] = [];
  const artifact: TextArtifact = { id:"text:1",profileId:"p1",captureId:"c1",snapshotId:"s1",
    snapshotDigest:"d",extractor:new Utf8TextExtractor().identity,outputDigest:"o",lineCount:2,storageKey:"text/o" };
  const useCase = new ExtractEvidenceText(
    { read: async () => ({profileId:"p1",captureId:"c1",snapshotId:"s1",snapshotDigest:"d",locator:"resume.md",bytes:content()}) },
    [new Utf8TextExtractor()],
    { store: async (input) => { assert.equal(input.text,"hello\nworld"); return artifact; }, record: async value => { attempts.push(value); } },
    {generate:()=>"run1"},{now:()=>new Date("2026-09-14T00:00:00Z")});
  const result = await useCase.execute({profileId:"p1",captureId:"c1"});
  assert.equal(result.outcome,"completed"); assert.equal(attempts.length,1);
});

test("records unsupported formats without reading their bytes", async () => {
  let read = false; async function* bytes(){ read=true; yield Buffer.from("x"); }
  const attempts: ExtractionAttempt[]=[];
  const result = await new ExtractEvidenceText(
    {read:async()=>({profileId:"p",captureId:"c",snapshotId:"s",snapshotDigest:"d",locator:"resume.pdf",bytes:bytes()})},[],
    {store:async()=>assert.fail(),record:async value=>{attempts.push(value)}},{generate:()=>"r"},{now:()=>new Date()}
  ).execute({profileId:"p",captureId:"c"});
  assert.equal(result.outcome,"failed"); assert.equal(result.outcome==="failed"&&result.errorCode,"UNSUPPORTED_FORMAT");
  assert.equal(read,false); assert.equal(attempts.length,1);
});

test("records an unavailable capture without disclosing snapshot lineage", async () => {
  const attempts: ExtractionAttempt[]=[];
  const result=await new ExtractEvidenceText(
    {read:async()=>{throw new EvidenceReadError("unavailable")}},[],
    {store:async()=>assert.fail(),record:async value=>{attempts.push(value)}},{generate:()=>"r"},{now:()=>new Date()}
  ).execute({profileId:"other",captureId:"c"});
  assert.equal(result.outcome,"failed");
  assert.equal(result.outcome==="failed"&&result.errorCode,"CAPTURE_UNAVAILABLE");
  assert.equal(result.snapshotId,undefined); assert.equal(attempts.length,1);
});

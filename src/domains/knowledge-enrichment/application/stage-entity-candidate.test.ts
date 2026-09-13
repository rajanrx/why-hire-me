import assert from "node:assert/strict";
import test from "node:test";
import { StageEntityCandidate } from "./stage-entity-candidate.js";
import type { CandidateRepository } from "../ports/candidate-staging-ports.js";
import { CandidateEvidenceUnavailableError } from "../ports/candidate-staging-ports.js";

test("validates all evidence before staging a typed proposal", async()=>{
  let staged=0;
  const repository:CandidateRepository={stage:async(candidate,submission)=>{staged++;return {candidate:{...candidate,id:"candidate:1"},submission:{...submission,candidateId:"candidate:1"},reused:false}}};
  const useCase=new StageEntityCandidate({resolve:async input=>({...input,snapshotId:"s",snapshotDigest:"d"})},repository,{generate:()=>"submission:1"},{now:()=>new Date("2026-09-14T00:00:00Z")});
  const result=await useCase.execute({profileId:"p",entityType:"Organisation",proposedName:" Lightspeed ",evidence:[{artifactId:"text:1",lineStart:2,lineEnd:3,relation:"supports"}],
    generator:{type:"model",id:"extractor",version:"1",modelIdentifier:"provider/model"},uncertainty:{level:"low",rationale:"Named explicitly"},
    reviewRequirement:"person-required",policyLabels:["private"],actorId:"agent",correlationId:"corr"});
  assert.equal(result.candidate.proposedName,"Lightspeed");assert.equal(result.candidate.status,"proposed");assert.equal(staged,1);
});

test("rejects unknown types and invalid evidence before staging",async()=>{
  let staged=0; const useCase=new StageEntityCandidate({resolve:async()=>assert.fail()}, {stage:async()=>{staged++;return assert.fail()}},{generate:()=>"x"},{now:()=>new Date()});
  await assert.rejects(()=>useCase.execute({profileId:"p",entityType:"SkillTag",proposedName:"TS",evidence:[{artifactId:"a",lineStart:0,lineEnd:1,relation:"supports"}],
    generator:{type:"human",id:"u",version:"1"},uncertainty:{level:"low",rationale:"x"},reviewRequirement:"person-required",policyLabels:[],actorId:"u",correlationId:"c"}));
  assert.equal(staged,0);
});

test("does not partially stage when any evidence citation is unavailable",async()=>{
  let resolved=0;let staged=0;
  const useCase=new StageEntityCandidate({resolve:async input=>{resolved++;if(resolved===2)throw new CandidateEvidenceUnavailableError();return {...input,snapshotId:"s",snapshotDigest:"d"}}},
    {stage:async()=>{staged++;return assert.fail()}},{generate:()=>"x"},{now:()=>new Date()});
  await assert.rejects(()=>useCase.execute({profileId:"p",entityType:"Work",proposedName:"Project",evidence:[
    {artifactId:"a",lineStart:1,lineEnd:1,relation:"supports"},{artifactId:"b",lineStart:2,lineEnd:2,relation:"contextualises"}],
    generator:{type:"skill",id:"interviewer",version:"1"},uncertainty:{level:"medium",rationale:"Needs review"},
    reviewRequirement:"person-required",policyLabels:["private"],actorId:"agent",correlationId:"c"}));
  assert.equal(resolved,2);assert.equal(staged,0);
});

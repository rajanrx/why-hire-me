import { CandidateValidationError, entityTypes, required, validateLineRange, type EntityCandidate, type EntityType, type GeneratorType, type UncertaintyLevel } from "../domain/entity-candidate.js";
import type { CandidateEvidenceReader, CandidateRepository } from "../ports/candidate-staging-ports.js";

export interface StageEntityCandidateRequest {
  readonly profileId:string; readonly entityType:string; readonly proposedName:string;
  readonly evidence:readonly {artifactId:string;lineStart:number;lineEnd:number;relation:"supports"|"contextualises"}[];
  readonly generator:{type:GeneratorType;id:string;version:string;modelIdentifier?:string};
  readonly uncertainty:{level:UncertaintyLevel;rationale:string};
  readonly identityHints?:readonly {namespace:string;value:string}[];
  readonly possibleDuplicateIds?:readonly string[]; readonly conflictCandidateIds?:readonly string[];
  readonly reviewRequirement:"person-required"|"policy-required"; readonly policyLabels:readonly string[];
  readonly actorId:string; readonly correlationId:string;
}

export class StageEntityCandidate {
  constructor(private readonly evidence:CandidateEvidenceReader,private readonly candidates:CandidateRepository,
    private readonly ids:{generate():string},private readonly clock:{now():Date}){}
  async execute(request:StageEntityCandidateRequest){
    const profileId=required(request.profileId,"Profile ID"); const proposedName=required(request.proposedName,"Proposed name");
    if(!entityTypes.includes(request.entityType as EntityType)) throw new CandidateValidationError(`Unknown entity type: ${request.entityType}`);
    if(request.evidence.length===0) throw new CandidateValidationError("At least one evidence citation is required.");
    if(!["human","model","skill","import"].includes(request.generator.type)) throw new CandidateValidationError("Unknown generator type.");
    if(!["low","medium","high","unknown"].includes(request.uncertainty.level)) throw new CandidateValidationError("Unknown uncertainty level.");
    if(!["person-required","policy-required"].includes(request.reviewRequirement)) throw new CandidateValidationError("Unknown review requirement.");
    const generator={type:request.generator.type,id:required(request.generator.id,"Generator ID"),version:required(request.generator.version,"Generator version"),
      ...(request.generator.modelIdentifier ? {modelIdentifier:required(request.generator.modelIdentifier,"Model identifier")} : {})};
    if(generator.type==="model"&&!generator.modelIdentifier) throw new CandidateValidationError("Model identifier is required for model-generated candidates.");
    const resolved=[];
    for(const citation of request.evidence){ validateLineRange(citation.lineStart,citation.lineEnd); resolved.push(await this.evidence.resolve({...citation,profileId})); }
    resolved.sort((a,b)=>{ const left=`${a.artifactId}:${a.lineStart}:${a.lineEnd}:${a.relation}`; const right=`${b.artifactId}:${b.lineStart}:${b.lineEnd}:${b.relation}`; return left<right?-1:left>right?1:0; });
    const identityHints=(request.identityHints??[]).map(h=>Object.freeze({namespace:required(h.namespace,"Identity namespace"),value:required(h.value,"Identity value")}));
    identityHints.sort((a,b)=>{ const left=`${a.namespace}:${a.value}`; const right=`${b.namespace}:${b.value}`; return left<right?-1:left>right?1:0; });
    const candidate:Omit<EntityCandidate,"id">={schemaVersion:"0.1",recordType:"EntityCandidate",knowledgeSpaceId:profileId,status:"proposed",
      entityType:request.entityType as EntityType,proposedName,evidence:Object.freeze(resolved),generator:Object.freeze(generator),
      uncertainty:Object.freeze({level:request.uncertainty.level,rationale:required(request.uncertainty.rationale,"Uncertainty rationale")}),
      identityHints:Object.freeze(identityHints),
      possibleDuplicateIds:Object.freeze([...(request.possibleDuplicateIds??[])].map(v=>required(v,"Duplicate candidate ID")).sort()),
      conflictCandidateIds:Object.freeze([...(request.conflictCandidateIds??[])].map(v=>required(v,"Conflict candidate ID")).sort()),
      reviewRequirement:request.reviewRequirement,policyLabels:Object.freeze([...request.policyLabels].map(v=>required(v,"Policy label")).sort())};
    return this.candidates.stage(Object.freeze(candidate),{id:this.ids.generate(),actorId:required(request.actorId,"Actor ID"),
      correlationId:required(request.correlationId,"Correlation ID"),submittedAt:this.clock.now().toISOString()});
  }
}

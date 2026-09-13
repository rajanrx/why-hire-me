# Interview record contract

Store records through domain ports. Field names are conceptual and do not prescribe a database.

## Shared envelope

Every record carries a stable ID, schema version, context, lifecycle status, actor/activity
provenance, relevant valid and recorded time, policy labels, authorised purpose, links to inputs and
outputs, AI involvement metadata where applicable, and no secret values.

## Discovery records

| Record | Required links |
|---|---|
| `ExplorationSession` | purpose, authorised sources, skill version, initiating person |
| `Lead` | source/evidence, knowledge gap, relevance, status |
| `Question` | lead/gap, purpose, question type, generated-by |
| `Response` | question, respondent, response artefact, time |
| `EvidenceReference` | snapshot and precise locator |
| `KnowledgeCandidate` | proposed type, subject/predicate/object, provenance, evidence |
| `AdmissionResult` | candidate, decision, rules applied, reason, reviewer |

Only `AdmissionResult=accepted` authorises the Person Knowledge application port to mutate
canonical state.

## Evaluation records

| Record | Required links |
|---|---|
| `EvaluationPlan` | opportunity, job analysis, criteria, methods, policy version |
| `Criterion` | definition, job relevance, observable indicators, weight if any |
| `Question` | criterion, type, core/adaptive status, allowed probes |
| `Response` | question, respondent, format/accommodation, artefacts |
| `Observation` | response/evidence, literal observation, author |
| `Finding` | criterion, observations, inference, uncertainty, author, AI assistance |
| `Rating` | criterion, anchor version, selected anchor, evidence, rater |
| `Outcome` | accountable human, findings considered, rationale, time |
| `Challenge` | challenged record, person's statement, resolution and author |

## Separation rules

- Observation is separate from inference.
- Uncertainty is separate from rating.
- Insufficient evidence is separate from low performance.
- AI drafts are separate from adopted human findings.
- Discovery candidates are separate from evaluation findings.
- Evaluation ratings never become canonical person knowledge.
- Evaluation responses are not reused for unrelated enrichment without explicit authority.

## AI trace

Record available model/provider identifiers, prompt/template or skill version, authorised input
record IDs, tool calls, output record ID, generation time, and human disposition. Retain enough to
explain and reproduce the process where practical.

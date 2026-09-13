# Knowledge curation record

Use this contract for a review session. Record recommendations separately from human dispositions
and returned admission results.

```yaml
schemaVersion: "0.1"
recordType: KnowledgeCuration
mode: governed-review | review-preview
status: applied | partially-applied | not-applied | blocked
knowledgeSpaceId: string
purpose: maintain-person-knowledge
reviewer:
  id: string | unknown
  authority: person | delegated-reviewer | policy-reviewer | unknown
queue:
  selection: explicit-ids | bounded-filter
  candidateIds: []
  snapshotAt: RFC-3339-timestamp | null
reviews:
  - candidateId: string
    evidenceStatus: sufficient | insufficient | unavailable | prohibited
    semanticStatus: valid | invalid | pending-registry-review
    identityStatus: resolved | possible-duplicate | conflicting | unresolved
    policyStatus: allowed | prohibited | requires-review | unknown
    freshnessStatus: current | stale | superseded | unknown
    recommendation: accept | reject | defer | request-change
    recommendationReason: string
    humanDisposition: accepted | rejected | deferred | not-provided
    humanReason: string | null
    admissionResult: applied | unchanged | failed | not-attempted
    resultingEntityId: string | null
    activityId: string | null
    limitations: []
summary:
  accepted: []
  rejected: []
  deferred: []
  unchanged: []
  blocked: []
unresolved:
  ambiguities: []
  contradictions: []
  predicates: []
  policyConcerns: []
```

`recommendation` records AI assistance; it has no canonical authority. `humanDisposition` records
what the authorised reviewer actually decided. `admissionResult=applied` requires a successful return
from the public admission port. In preview mode, every admission result is `not-attempted`.

Do not include secret values or unnecessary evidence excerpts. Stable record IDs and source locators
are preferable to copied source content.

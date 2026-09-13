# Asynchronous interview record

Use the shared evaluation record contract from `evidence-led-interviewer`. Add this delivery envelope
without collapsing response, observation, finding, rating, and outcome.

```yaml
schemaVersion: "0.1"
recordType: AsyncInterviewSession
mode: prepare | facilitate | review
status: draft | not-ready-for-evaluation | ready | in-progress | submitted | under-review | complete | withdrawn | blocked
opportunityId: string
evaluationPlan:
  id: string
  version: string
  approved: true | false
  accountableEvaluator: string | unknown
  jobAnalysisId: string | null
  criteriaIds: []
  anchorVersion: string | null
  evidenceViewId: string | null
  evidenceViewVersion: string | null
  policyVersion: string | null
participant:
  id: string
  noticeVersion: string
  acknowledgedAt: RFC-3339-timestamp | null
delivery:
  timezone: IANA-timezone
  openedAt: RFC-3339-timestamp | null
  dueAt: RFC-3339-timestamp | null
  submittedAt: RFC-3339-timestamp | null
  formatsAllowed: []
  pauseResumeAllowed: true | false
  accommodations: []
questions:
  - questionId: string
    criterionIds: []
    core: true | false
    probeFamily: string | null
    presentedAt: RFC-3339-timestamp | null
    responseArtefactId: string | null
    deliveryEvents: []
review:
  observationIds: []
  findingIds: []
  ratingIds: []
  insufficientEvidenceCriteria: []
  aiDrafts: []
outcome:
  id: string | null
  decidedBy: accountable-human | null
  recordedAt: RFC-3339-timestamp | null
rights:
  challengeRoute: string
  humanReviewRoute: string
  retentionPolicy: string
```

Delivery events and accommodations are operational records, not negative performance evidence.
`complete` requires the authorised workflow's human outcome; AI generation alone cannot populate it.
Do not place secret values, unnecessary identity data, or protected-trait inferences in this record.

# Job application package record

Use this contract for a reviewable application package. The job description and career view are
different inputs with different authority.

```yaml
schemaVersion: "0.1"
recordType: JobApplicationPackage
mode: governed-application | session-draft
status: draft | ready-for-person-review | blocked
opportunity:
  id: string
  title: string
  organisationAsAdvertised: string | unknown
  sourceLocator: string
  capturedEvidenceId: string | null
  retrievedOrSuppliedAt: RFC-3339-timestamp | null
  limitations: []
careerView:
  id: string | null
  version: string | null
  validation: validated | partially-validated | unvalidated | unavailable
  freshness: current | stale | unknown
requirements:
  - id: string
    text: string
    locator: string
    kind: essential | preferred | contextual | administrative | ambiguous
    interpretation: string | null
    evidenceStatus: supported | partially-supported | insufficient-evidence | conflicting | not-applicable
    careerRecordIds: []
    evidenceLocators: []
    transferAssumptions: []
    uncertainty: string | null
    nextQuestion: string | null
evaluation:
  strengths: []
  partialMatches: []
  gaps: []
  conflicts: []
  unansweredQuestions: []
artefacts:
  resume:
    status: drafted | omitted
    contentOrArtefactId: string
  coverLetter:
    status: drafted | omitted
    contentOrArtefactId: string
  applicationAnswers: []
claimTrace:
  - generatedArtefact: resume | cover-letter | application-answer
    statementLocator: string
    careerRecordIds: []
    requirementIds: []
    sourceType: reviewed-knowledge | person-stated-confirmed
    limitations: []
externalAction:
  submitted: false
  published: false
  contactedEmployer: false
```

`insufficient-evidence` is not a negative capability rating. `person-stated-confirmed` may appear only
in a session draft unless it has passed governed knowledge review. Generated artefacts are projections
and cannot write facts back into canonical knowledge.

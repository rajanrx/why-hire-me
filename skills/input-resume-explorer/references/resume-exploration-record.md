# Résumé exploration record

Use this contract for the final review. Omit empty optional fields rather than filling them with
guesses.

```yaml
schemaVersion: "0.1"
recordType: ResumeExploration
mode: governed-import | session-only
status: staged | not-persisted | blocked
purpose: private-career-discovery
source:
  name: string
  mediaType: string | unknown
  capturedEvidenceId: string | null
  digest: string | null
  locatorScheme: page | line | section | structured | session-only
  limitations: []
observations:
  - text: string
    locator: string
entityProposals:
  - entityType: Person | Organisation | Engagement | Role | Work | Contribution | Artefact | Technology | TechnologyUse | Credential
    proposedName: string
    evidenceLocators: []
    uncertainty:
      level: low | medium | high | unknown
      rationale: string
    identityHints: []
    possibleDuplicates: []
    reviewRequired: true
claimProposals:
  - subject: string
    predicate: controlled-term | pending-registry-review
    object: string
    evidenceLocators: []
    uncertainty:
      level: low | medium | high | unknown
questions: []
ambiguities: []
contradictions: []
excluded:
  - item: string
    reason: string
```

`staged` means a candidate tool accepted the proposal into staging; it does not mean canonical or
verified. Use `not-persisted` whenever the work exists only in the conversation. Use `blocked` when
the source cannot be read or the person has not authorised it.

Every observation or proposal must point to a locator where the source format permits one. Mark a
claim predicate `pending-registry-review` when no controlled term exists; never invent a permanent
predicate inside the record.

# Career reference exploration record

Use this contract for final review. Keep each retrieved reference separate even when pages describe
the same artefact or credential.

```yaml
schemaVersion: "0.1"
recordType: CareerReferenceExploration
mode: governed-import | session-only
status: staged | not-persisted | blocked
purpose: private-career-discovery
sources:
  - requestedLocator: string
    resolvedLocator: string | null
    canonicalLocator: string | null
    redirects: []
    sourceRelationship: person-controlled | issuer-controlled | organisation-controlled | independent-third-party | unknown
    publisher: string | unknown
    retrievedAt: RFC-3339-timestamp | null
    publishedAt: RFC-3339-timestamp | null
    modifiedAt: RFC-3339-timestamp | null
    expiresAt: RFC-3339-timestamp | null
    capturedEvidenceId: string | null
    digest: string | null
    access: public | access-controlled | unavailable | unknown
    limitations: []
observations:
  - text: string
    source: string
    locator: string
    state: observed | publisher-asserted | identity-linked | independently-verified | unresolved
    subjectIdentity: confirmed | ambiguous | unknown
verificationEvents:
  - method: string
    source: string
    performedAt: RFC-3339-timestamp
    outcome: confirmed | not-confirmed | inconclusive
    limitations: []
entityProposals:
  - entityType: Artefact | Credential | Organisation | Work | Contribution | Technology | TechnologyUse | TechnologyCategory | Person | Engagement | Role
    proposedName: string
    originalIdentifiers: []
    evidenceLocators: []
    uncertainty:
      level: low | medium | high | unknown
      rationale: string
    reviewRequired: true
claimProposals: []
questions: []
ambiguities: []
skippedLeads:
  - locator: string
    reason: not-authorised | irrelevant | unavailable | unsafe | duplicate
```

Use `independently-verified` only when a separate, recorded verification method ran within the
authorised scope. A publisher assertion is not independent verification. Use `not-persisted` for
conversation-only reading and `blocked` when the reference cannot be accessed or authorised safely.

Do not store login secrets, session tokens, unnecessary third-party personal data, or search-engine
snippets as though they were the referenced source.

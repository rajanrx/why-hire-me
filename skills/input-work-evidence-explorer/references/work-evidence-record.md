# Work evidence exploration record

Use this contract for the final review. Omit empty optional fields and preserve source-local
identifiers rather than exposing source content unnecessarily.

```yaml
schemaVersion: "0.2"
recordType: WorkEvidenceExploration
mode: governed-import | session-only
status: staged | not-persisted | blocked
purpose: private-career-discovery
scope:
  included: []
  excluded: []
  metadataAllowed: false
  historyAllowed: false
  operations: [list, read]
  privacy: private
  publicDisclosureApproved: false
sources:
  - name: string
    mediaType: string | unknown
    capturedEvidenceId: string | null
    digest: string | null
    locatorScheme: file-line | page-section | slide | frame | timestamp | record | structured | session-only
    limitations: []
observations:
  - id: stable-observation-id
    text: string
    source: string
    locator: string
    observationType: direct | person-stated | derived
    attribution: confirmed | shared | ambiguous | unknown
    disclosure: summary-only | excerpt-approved
    basis: source-artefact | authored-change | person-account | internal-report-or-meeting | inference
    limitations: []
technologyUses:
  - technology: string
    workContext: string
    contribution: string | null
    observationIds: []
    status: directly-observed | authored-change | person-stated | present-in-shared-repo | unresolved
    publicWordingApproved: false
reportedOutcomes:
  - statement: string
    observationIds: []
    measure:
      start: string | null
      end: string | null
      unit: string | null
      period: string | null
    causalAttribution: supported | person-stated | unresolved
    publicWordingApproved: false
entityProposals:
  - entityType: Work | Contribution | Artefact | Technology | TechnologyUse | TechnologyCategory | Organisation | Engagement | Role
    proposedName: string
    evidenceLocators: []
    uncertainty:
      level: low | medium | high | unknown
      rationale: string
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
skipped:
  - source: string
    reason: out-of-scope | sensitive | secret | generated | vendored | binary | unreadable | irrelevant
portfolioHandoff:
  targetSkill: output-career-portfolio
  existingViewId: string | null
  reviewedProposalIds: []
  pendingAttributionIds: []
  pendingPublicWordingIds: []
  status: ready-for-gateway | needs-review | not-requested
```

`staged` means a candidate tool accepted proposals into governed staging, not that they are admitted
or verified. Use `not-persisted` for conversation-only work and `blocked` when authority, readable
evidence, or a safe scope is missing.

Every material observation and proposal must point to an authorised locator where the source format
permits one. Derived observations identify their inputs. Never place raw secrets or unnecessary
third-party personal information in this record.

`basis` prevents a person-stated business outcome or leadership account from being promoted to a
repository-verified fact. A technology merely present in a shared repo remains
`present-in-shared-repo` until the work context and attribution are established. Keep reporting
freshness, query latency, and user-visible mobile latency as separate `reportedOutcomes` when they
have different start and end points. The handoff proposes content; it never edits a portfolio.

# Portfolio generation record

Use this contract for preview and completion. `local-prototype` and `governed-render` remain visibly
different even if both produce usable static files.

```yaml
schemaVersion: "0.3"
recordType: CareerPortfolioGeneration
mode: governed-render | local-prototype | blocked
status: preview | generated | verification-failed | blocked
release:
  id: string
  version: string
  digest: string | null
  validation: validated | partially-validated | unvalidated | invalid
  authority: string
  createdAt: RFC-3339-timestamp | null
  expiresAt: RFC-3339-timestamp | null
prototypeInput:
  packetId: string | null
  sourceIdentities: []
  evidenceLocators: []
  reviewAuthority: string | null
  validation: partially-validated | unvalidated | null
  status: session-only | not-applicable
priorProjection:
  directory: absolute-path | null
  manifestDigest: string | null
  projectionId: string | null
  baselineStatus: inventoried | absent | unresolved
templateConformance:
  contractSchema: why-hire-me.portfolio-template/v0.3
  source: canonical-renderer | existing-approved-shell | canonical-template-prototype-candidate | approved-template-revision
  baselineRendererVersion: string | null
  baselineShellDirectory: absolute-path | null
  changedVisualOrInteractionAssets:
    - path: relative-path
      rationale: string
      personApproved: true | false
  structuralChanges: []
  personApprovedRevision: true | false
candidatePreview:
  directory: absolute-path | null
  mainPortfolioUnchanged: true
  mappedFromReviewedPrototype: true | false
  replacementApproved: true | false
  pendingTemplateAssetPaths: []
  unresolvedCarryForwardIds: []
preview:
  outputPath: absolute-path
  replacesExisting: true | false
  resumeLength: one-page | two-pages | three-pages | complete
  sections: []
  inclusionMap:
    - recordId: string
      recordType: Work | Contribution | reported-outcome
      status: featured | supporting | summarised | excluded | deferred
      summarisedUnderRecordId: string | null
      rationale: string
  inclusionCoverage:
    total: integer
    featured: integer
    supporting: integer
    summarised: integer
    excluded: integer
    deferred: integer
    unresolvedRecordIds: []
  technologyUseMap:
    - technologyUseId: string
      workContextId: string
      status: visible-in-context | visible-in-expertise | summarised-under | excluded | deferred
      targetRecordId: string | null
      rationale: string
  technologyUseCoverage:
    total: integer
    unresolvedTechnologyUseIds: []
  referenceLinkMap:
    - linkId: string
      targetRecordId: string | null
      displayedLabel: string
      targetUrl: string
      status: visible-on-work | visible-in-evidence | summarised-under | excluded | deferred
      summarisedUnderRecordId: string | null
      sourceStatus: supplied-unvisited | separately-reviewed
      rationale: string
  referenceLinkCoverage:
    total: integer
    unresolvedLinkIds: []
  carryForwardMap:
    - baselineItemId: string
      itemType: record | claim | date-title | technology-use | relationship | evidence-reference | contact | redaction
      oldLocator: string
      newLocator: string | null
      disposition: preserved | reworded | relocated | superseded | excluded | unresolved
      rationale: string | null
      personApproved: true | false
  carryForwardCoverage:
    total: integer
    unresolvedBaselineItemIds: []
    locatorValidation: file-and-record-or-anchor-target-resolution
  entityReadoutMap:
    - entityId: string
      entityType: Organisation | Role | Work | Contribution | Technology | reported-outcome | other
      summaryStatus: specific | related-records-only | deferred
      selectedEntitySummary: string | null
      contextRecordIds: []
      attributionStatus: reviewed | person-stated | unverified | not-applicable
      duplicateOfParentSummary: true | false
  initiativeContextMap:
    - workId: string
      situationAndAudience: string | null
      personRoleAndDecisionIds: []
      technologyUseIds: []
      reportedOutcomeIds: []
      supportingEvidenceIds: []
      evidenceGap: string | null
      measurementScope: string | null
      linkedEngagementId: string | null
  entityReadoutCoverage:
    totalEntities: integer
    specificReadoutCount: integer
    missingContextEntityIds: []
    sampledTypes: [organisation, role, work, contribution, technology, outcome]
    mobileSelectedRecordBottomDrawer: planned | not-applicable
  changes: []
  personalDisclosure:
    - fieldId: string
      fieldType: email | phone | address | date-of-birth | citizenship | professional-profile | other
      status: approved-for-audience | omitted | deferred
      audience: string
      consentReference: string | null
  redactions: []
  warnings: []
  approvedByPerson: true | false
projection:
  schema: why-hire-me.portfolio/v0.3 | null
  renderer: string
  rendererVersion: string
  label: production | prototype
  entryFile: string | null
  manifestFile: string | null
  digest: string | null
  buildMarker: why-hire-me.build/v1 | null
  files: []
verification:
  passed: []
  failed: []
  warnings: []
delivery:
  local: true | false
  uploaded: false
  public: false
```

`generated` requires successful required verification. A prototype cannot claim deterministic
production rendering. Local approval is not publication consent, and all delivery fields remain false
except `local` in this skill.

The inclusion map is total over every authorised Work, Contribution, and reported outcome. A missing,
duplicate, invalid, or deferred decision prevents `generated`. `approvedByPerson` can become true only
after the complete map and unresolved list have been shown in the exact preview.

For a prototype built without an immutable release, omit `release`, populate `prototypeInput`, and
never claim release validation or production identity. For a new portfolio, omit `priorProjection`
and leave `carryForwardMap` empty. Any `generated` projection requires complete achievement,
technology-use, and reference-link maps with no unresolved or deferred IDs. An update additionally
requires a complete prior-projection carry-forward map, with every exclusion or supersession
explicitly reviewed. A change in layout does not justify an unresolved
baseline item. The old projection is a comparison baseline, not a source of newly verified facts.

A person-requested side-by-side template preview may contain candidate files while the generation
record remains `status: preview`, `mode: local-prototype`, and `approvedByPerson: false`. Populate
`candidatePreview` and `templateConformance.source: canonical-template-prototype-candidate`;
the candidate does not replace the main portfolio. Its reviewed packet may be mapped to a prototype
display model, never to a forged `ValidatedKnowledgeRelease`. A missing PDF, link, privacy choice,
or approved baseline fact remains an unresolved carry-forward item rather than disappearing from
the candidate. Show the rendered candidate and complete maps before asking for approval of the
template revision and replacement. After approval and complete verification, record the applied
template as `approved-template-revision` and change status to `generated`.

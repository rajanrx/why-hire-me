# Offline career portfolio example

Use this skill with one authorised, versioned career knowledge release. It accounts for every
achievement, generates a professional light-first career explorer, and stops before hosted delivery.
It is also the only skill that creates or updates the main local portfolio. Reviewed input-skill
findings reach it as a handoff; publisher skills receive only its completed bytes.

## Prompt

```text
Use why-hire-me:output-career-portfolio with the attached authorised release.
Create an inclusion decision for every Work, Contribution, and reported outcome. Show me the exact
map before generation. Then build an offline portfolio with Experience, Expertise, Graph, and
Evidence views; explicit entity drill-down in a wide side navigator; and a printable résumé. Ask me
whether its print target should be one, two, three, or complete pages. Do not use remote assets,
analytics, or a dark theme by default.
```

## Expected preview

For an existing portfolio, use a more explicit update request:

```text
Use why-hire-me:output-career-portfolio to preview an update to this existing portfolio:
<absolute portfolio directory>. Use these reviewed new evidence proposals: <bounded packet or
release>. Compare every existing approved record, claim, scoped date, technology use, relationship,
and evidence reference with the proposed result. Show additions, rewording, relocations,
supersessions, exclusions, and unresolved provenance gaps before replacing files. Keep the old
bundle recoverable. Reconcile product and documentation links as well as technology use. Do not
publish; I will review the local preview first.
```

The gateway keeps source provenance in the evidence view; the main work narrative describes the
career contribution rather than saying it was found by scanning a résumé or repository. A
person-stated outcome from internal reporting remains attributed without exposing confidential
sales material.

```yaml
schemaVersion: "0.3"
mode: governed-render
status: preview
release:
  id: release-12
  version: "1.2.0"
  validation: validated
preview:
  outputPath: /absolute/path/career-portfolio/
  replacesExisting: false
  resumeLength: complete
  sections: [experience, expertise, focused knowledge graph, evidence, printable resume, inclusion map]
  inclusionMap:
    - recordId: work-analytics-foundation
      recordType: Work
      status: featured
      summarisedUnderRecordId: null
      rationale: Strong relevance and evidence for the intended audience.
    - recordId: work-live-reporting-product
      recordType: Work
      status: supporting
      summarisedUnderRecordId: null
      rationale: A distinct customer-facing product retained in the achievement index.
    - recordId: contribution-payment-integration
      recordType: Contribution
      status: summarised
      summarisedUnderRecordId: work-commerce-platform
      rationale: Preserved beneath the directly related platform narrative.
    - recordId: work-crm-integration
      recordType: Work
      status: excluded
      summarisedUnderRecordId: null
      rationale: Lower relevance to this audience; remains visible in this inclusion map.
  inclusionCoverage:
    total: 4
    featured: 1
    supporting: 1
    summarised: 1
    excluded: 1
    deferred: 0
    unresolvedRecordIds: []
  technologyUseCoverage:
    total: 0
    unresolvedTechnologyUseIds: []
  referenceLinkCoverage:
    total: 0
    unresolvedLinkIds: []
  personalDisclosure:
    - fieldId: contact-email
      fieldType: email
      status: omitted
      audience: public
      consentReference: null
  approvedByPerson: false
```

Approval comes after this map. A missing or deferred achievement blocks generation. The resulting
graph draws only explicit release relationships. Click focuses a node; the explore icon, keyboard,
double-click, right-click, or long-press opens the wide side navigator. When relationship claims are
absent, the portfolio says so instead of inventing connections.

## Development CLI

Save the approved map as a JSON array, preview it, then confirm the exact plan:

```sh
pnpm run cli portfolio preview \
  --release "<release-directory>" \
  --inclusion-map "./inclusion-map.json" \
  --resume-length complete

pnpm run cli portfolio build \
  --release "<release-directory>" \
  --inclusion-map "./inclusion-map.json" \
  --resume-length complete \
  --confirm
```

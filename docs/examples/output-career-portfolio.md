# Offline career portfolio example

Use this skill with one authorised, versioned career knowledge release. It accounts for every
achievement, generates a professional light-first career explorer, and stops before hosted delivery.

## Prompt

```text
Use why-hire-me:output-career-portfolio with the attached authorised release.
Create an inclusion decision for every Work, Contribution, and reported outcome. Show me the exact
map before generation. Then build an offline portfolio with a searchable record explorer, clickable
relationship graph, technical context, evidence, and a printable résumé. Do not use remote assets,
analytics, or a dark theme by default.
```

## Expected preview

```yaml
schemaVersion: "0.2"
mode: governed-render
status: preview
release:
  id: release-12
  version: "1.2.0"
  validation: validated
preview:
  outputPath: ./career-portfolio/
  replacesExisting: false
  sections: [career brief, achievement index, record explorer, knowledge graph, relationship index, printable resume, inclusion map]
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
  approvedByPerson: false
```

Approval comes after this map. A missing or deferred achievement blocks generation. The resulting
graph draws only explicit release relationships; when relationship claims are absent, the portfolio
says so and relies on its searchable record explorer instead of inventing connections.

## Development CLI

Save the approved map as a JSON array, preview it, then confirm the exact plan:

```sh
pnpm run cli portfolio preview \
  --release "<release-directory>" \
  --inclusion-map "./inclusion-map.json"

pnpm run cli portfolio build \
  --release "<release-directory>" \
  --inclusion-map "./inclusion-map.json" \
  --confirm
```

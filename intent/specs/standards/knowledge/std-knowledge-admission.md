---
id: std-knowledge-admission
status: accepted
version: 0.1.0
date: 2026-09-13
owner: knowledge-governance
enforced_by:
  - src/domains/knowledge-enrichment/application/stage-entity-candidate.test.ts
  - src/domains/person-knowledge/application/review-entity-candidate.test.ts
  - src/domains/person-knowledge/application/create-authorised-view.test.ts
  - src/domains/publication/application/create-local-knowledge-release.test.ts
---

# Standard: Knowledge admission

## Rule

No import, transcript, crawler result, or AI inference writes directly to canonical person
knowledge. It enters as evidence or candidate knowledge and passes admission first.

## Minimum admission checks

An admitted item must have:

- a recognised semantic type and stable identity;
- schema version and knowledge-space ownership;
- provenance identifying source/agent and generating activity;
- evidence or an explicit `unsupported-assertion` classification;
- lifecycle and policy metadata;
- resolved or explicitly unresolved duplication and identity ambiguity;
- the review required for its claim type; and
- no embedded secret or output-vendor authority.

Every candidate receives an `accepted`, `rejected`, or `deferred` result with reason and time.

## Publication gate

Only canonical knowledge selected through an authorised view may enter a release. Raw snapshots,
exploration transcripts, rejected candidates, and secrets are excluded unless a view explicitly
permits a safe representation.

## Enforcement

Blocking tests require evidence before staging, prevent direct or unauthorised admission, reject
secret-labelled acceptance, filter authorised views, and fail release validation on foreign, secret,
or tampered records. The architecture check prevents domain code from bypassing owned ports.

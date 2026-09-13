## Why

Extracted evidence cannot become useful semantic knowledge until proposed meaning has a governed,
reviewable staging boundary. Adding that boundary now prevents future AI adapters from writing
directly into canonical person knowledge.

## What Changes

- Stage typed entity candidates linked to precise extracted-text evidence.
- Require derivation provenance, uncertainty, identity hints, review requirements, and policy labels.
- Validate evidence ownership and line ranges before accepting a candidate into staging.
- Make equivalent proposals idempotent while preserving each submission activity.

Non-goals: claim or relationship predicates, automatic AI extraction, identity merging, candidate
admission, canonical writes, scoring, evaluation, or publication.

## Capabilities

### New Capabilities

- `entity-candidate-staging`: Governed staging for typed, evidence-linked entity proposals.

### Modified Capabilities

None.

## Impact

Adds Knowledge Enrichment candidate contracts, local staging persistence, evidence validation, and
a JSON-driven CLI boundary usable by future model, skill, and connector adapters.

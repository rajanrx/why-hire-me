---
id: adr-0008
status: proposed
date: 2026-09-13
owner: architecture/domain
---

# ADR-0008: Represent knowledge as entities and first-class claims

## Context

The platform must represent relationships while retaining who asserted them, what evidence supports
or contradicts them, when they applied, whether they were reviewed, and how they changed. Bare graph
edges or nested profile fields cannot carry this governance consistently.

## Decision

The canonical semantic model contains stable `Entity` records and first-class `Claim` records.
A claim expresses subject, controlled predicate, and entity reference or typed literal object.
Evidence, attribution, time, review, lifecycle, and verification signals attach to that claim.

Accepted claims may be projected into graph edges, relational views, search documents, or vector
chunks. Those projections are not canonical.

Aliases are namespace-qualified lookup records. Alias equality may propose identity resolution but
never merges entities automatically.

## Consequences

- Conflicting accounts can coexist without data loss.
- Provenance and access policy can apply at statement granularity.
- Storage and query engines remain replaceable.
- Reads require projections or claim-aware traversal and are more involved than nested documents.
- Predicate governance and schema evolution become necessary.

## Rejected directions

- Free-form tags are ambiguous and cannot express context or evidence.
- Bare edges lose statement identity and lifecycle.
- One denormalised person document encourages duplicated organisations, roles, and technologies.

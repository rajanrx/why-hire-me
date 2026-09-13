---
id: adr-0011
status: accepted
date: 2026-09-13
owner: architecture
---

# ADR-0011: Use intent-linked OpenSpec with one review

## Context

Durable intent, architecture, and domain rules already live under `intent/specs`. Implementation
changes need behavioural specifications and execution tasks without copying that intent into a
second source of truth or allowing the reason for a change to disappear during implementation.

The larger council and approval workflow used by other repositories is disproportionate at this
stage of the project. An entirely informal workflow, however, cannot enforce traceability.

## Decision

Use OpenSpec for proposed and in-flight changes. Durable product truth remains under
`intent/specs`; OpenSpec does not replace it.

The project-local `why-hire-me` schema follows this artifact flow:

```mermaid
flowchart LR
    proposal[Proposal] --> intent["Typed intent.yaml"]
    intent --> specs[Behavioural specs]
    specs --> design[Design]
    design --> tasks[Tasks]
    tasks --> review[Quick review]
    review --> apply[Apply]
```

Every change contains `intent.yaml` with typed IDs, exact repository-relative intent paths, and a
reason for each reference. Repository validation checks that paths stay below `intent/specs`, files
exist, and IDs occur in their declared targets.

One quick review of the complete planning package is required before apply. The reviewer records
`APPROVED` or `CHANGES_REQUESTED`; no council or multi-tier approval is required. A later change may
strengthen review if team size, risk, or regulatory needs justify it.

## Consequences

- Product intent and implementation deltas have distinct owners and lifecycles.
- A change cannot silently lose its stated connection to product goals and architecture.
- Review remains lightweight enough to use on every change.
- The custom schema is versioned with the repository and may need deliberate updates when OpenSpec
  changes its schema contract.
- ID occurrence validation prevents dangling links but does not yet prove semantic relevance; the
  quick reviewer remains responsible for that judgement.

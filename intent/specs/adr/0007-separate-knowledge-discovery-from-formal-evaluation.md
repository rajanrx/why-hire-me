---
id: adr-0007
status: proposed
date: 2026-09-13
owner: product/architecture
---

# ADR-0007: Separate knowledge discovery from formal evaluation

## Context

An AI can ask adaptive questions to help a person uncover and organise their work. A hiring
interview has a different purpose and requires comparable, job-related treatment. Combining the
two would let exploratory questions become undeclared selection criteria or let evaluation records
pollute person-controlled knowledge.

## Decision

Support two explicit operating modes:

- `knowledge-discovery` belongs to Knowledge Enrichment, adapts to evidence gaps, and produces
  candidate knowledge without scores;
- `formal-evaluation` belongs to Evaluation, requires an opportunity, job analysis, declared
  criteria, standardised core questions, bounded probes, rating anchors, and a human decision owner.

The mode is recorded before questioning and cannot change silently. Both modes can use the shared
`evidence-led-interviewer` skill, but domain ports and output records remain separate.

## Consequences

- Personalisation can be deep during discovery without making candidate comparisons arbitrary.
- Formal evaluations can be audited and tested for reliability, validity, fairness, and consistency.
- Evidence supplied during an evaluation is not reused for personal enrichment without authority.
- The product must explain the active mode and AI's role to the person.

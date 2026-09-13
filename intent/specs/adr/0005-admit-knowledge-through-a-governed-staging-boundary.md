---
id: adr-0005
status: proposed
date: 2026-09-13
owner: architecture
---

# ADR-0005: Admit knowledge through a governed staging boundary

## Context

Imports, link traversal, agent questions, and AI extraction will produce duplicates, weak
inferences, irrelevant detail, and conflicting descriptions. Writing all of it directly to the
knowledge graph would turn the platform into a dumping ground.

## Decision

Use an explicit lifecycle:

```text
captured source -> exploration -> candidate knowledge -> admission -> canonical knowledge -> view -> release
```

Captured content and exploration transcripts are evidence, not canonical knowledge. Enrichment
creates typed candidates. Admission validates schema, identity resolution, provenance, evidence,
policy, duplication, and review requirements before canonical mutation.

Every admission result is accepted, rejected, or deferred with a reason. AI cannot bypass this
boundary. The rules are defined by [`std-knowledge-admission`](../standards/knowledge/std-knowledge-admission.md).

## Consequences

- Canonical knowledge remains intentional and explainable.
- New extractors can improve without corrupting established meaning.
- Staging needs retention and deletion rules of its own.
- Admission may initially be simple and human-led, then become more automated by claim type.

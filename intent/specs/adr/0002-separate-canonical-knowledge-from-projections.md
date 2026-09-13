---
id: adr-0002
status: proposed
date: 2026-09-13
owner: architecture
---

# ADR-0002: Separate canonical knowledge from projections

## Context

The product needs linked knowledge, evidence retrieval, AI exploration, and several external
outputs. Each requires a different read shape, but none should become the source of truth.

## Decision

Maintain three separate forms of state:

1. immutable or tamper-evident source snapshots;
2. canonical nodes, typed relationships, provenance, and access metadata; and
3. disposable projections for search, vectors, graph traversal, interfaces, and destinations.

The canonical model is a logical graph but storage-neutral. A file-backed node-and-edge store is a
valid start. A relational or graph database can replace it behind the repository port when access
patterns justify the change.

Every projection records the canonical version or event position from which it was built.
Projection updates are idempotent and replayable.

## Consequences

- AI models and output products can change without migrating canonical knowledge.
- Search and delivery workloads can scale independently.
- The system must operate and monitor projection lag.
- Deletion and revocation must propagate to every derived copy.

## Rejected directions

- A vector database as the source of truth loses explicit relationships and provenance.
- A destination notebook or generated profile as the source of truth creates vendor lock-in.
- A linked list cannot represent the required many-to-many evidence graph.

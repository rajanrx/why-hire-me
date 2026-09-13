---
id: adr-0001
status: accepted
date: 2026-09-13
owner: architecture
---

# ADR-0001: Own ports in a hexagonal core

## Context

The product must accept new evidence sources and expose knowledge through new interfaces without
becoming coupled to any source, AI provider, database, or destination.

## Decision

Use hexagonal architecture. The domain and application core own the contracts at every boundary.

- Driving ports express use cases such as ingest evidence, review knowledge, create an evaluation,
  answer a question, and publish a view.
- Driven ports express capabilities needed by those use cases, such as persistence, source fetch,
  search, AI inference, policy, and publication.
- Adapters translate vendor and transport models at the edge.
- Adapters never bypass the core by depending directly on one another.

NotebookLM, GPT, Gemini, web interfaces, APIs, and MCP are possible output adapters. AI providers
used by the core are separate driven adapters.

Hexagonal architecture does not imply microservices. Begin with strong module boundaries and move
an adapter or workload out of process only when measured scale or isolation requires it.

## Consequences

- The core remains testable and vendor-neutral.
- Ports need semantic contract tests; an interface alone does not prove substitutability.
- Translation and versioning add work at each boundary.
- Independent adapters, indexes, and workers can scale without splitting the domain prematurely.

## Rejected direction

Vendor-shaped services calling each other directly were rejected because vendor replacement would
change the business core and make provenance and policy enforcement inconsistent.

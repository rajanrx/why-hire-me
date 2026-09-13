---
id: adr-0004
status: proposed
date: 2026-09-13
owner: architecture
---

# ADR-0004: Distinguish domains, skills, tools, and connectors

## Context

Résumé import, local source inspection, link traversal, questioning, GitHub publishing, and
NotebookLM synchronisation can all look like “tools”. Treating input and output technologies as
business domains would make boundaries follow today's vendors instead of enduring rules.

## Decision

- A **domain** owns business language, state, and invariants.
- A **port** is a core-owned contract at a domain/application boundary.
- A **connector** is adapter code for a system, protocol, model, or storage technology.
- A **tool** is an operation an agent or human can invoke through a port or adapter.
- A **skill** is a versioned workflow that coordinates tools under domain and governance rules.

Input and output remain first-class plugin families, but their domains are named for business
responsibility: Evidence Acquisition and Publication.

## Consequences

- A local-code tool can be replaced by a design-file, case-record, or portfolio tool for another
  profession without changing the knowledge domain.
- Skills can be reused across connectors without owning canonical data.
- Tool schemas, permissions, side effects, and supported connector capabilities must be discoverable.

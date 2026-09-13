---
id: adr-0009
status: proposed
date: 2026-09-13
owner: architecture
---

# ADR-0009: Package capabilities as an installable AI plugin

## Context

People should be able to install the product on their own computer and grow it through additional
skills and input or output adapters. Packaging must not make Codex, a model provider, or a vendor
connector part of the domain core.

## Decision

The repository is a versioned AI plugin. Its manifest discovers repository-owned skills from the
plugin-standard `skills/` directory. `.agents/skills` is a compatibility link to that canonical
directory for repository-local discovery. Future local tools and MCP servers will expose
application ports rather than domain storage, and each adapter will declare the permissions and
credentials it needs.

The plugin is a distribution and composition boundary, not a domain. Canonical contracts remain
host-neutral, so the same core can later be packaged for other compatible agent hosts.

The first plugin release contains only workflows that are usable without connector infrastructure:
evidence-led interviewing and the daily work diary. Acquisition, persistence, query, and
publication capabilities enter the plugin incrementally when their ports and governance are
implemented.

## Consequences

- Skills have one canonical location shared by repository development and plugin distribution.
- Installation alone grants no access to local files, accounts, secrets, or external destinations.
- Connectors can be added without changing the semantic model or existing skills.
- The initial plugin proves packaging and skill composition, not the complete product workflow.
- Additional host-specific packages may be needed without becoming separate domain models.

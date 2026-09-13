---
id: adr-0019
status: accepted
date: 2026-09-14
owner: architecture
---

# ADR-0019: Compose publication as parent and destination skills

## Context

A single publishing skill that knows GitHub, NotebookLM, Firebase, and every future platform would
grow vendor branches, credential rules, retry behaviour, and visibility assumptions indefinitely.
Making vendors direct children of the core would instead leak destination concepts across domain ports.

## Decision

Use a three-level publication tree:

1. `output-career-publisher` owns destination-neutral selection, exact input identity, intended
   audience and visibility, per-destination confirmation, coordination, and aggregate results;
2. one `output-<destination>-*` leaf skill owns the user workflow and safety semantics for a single
   destination; and
3. a replaceable connector adapter translates the Publication port to that destination's API,
   authentication, rate limits, identifiers, failures, and observed state.

The parent calls only an installed compatible leaf capability. It does not read credentials, import a
vendor SDK, upload bytes, or claim destination success. A leaf consumes only an authorised release or
completed projection, obtains credentials at runtime through a credential boundary, previews the exact
destination action, and records requested, attempted, accepted, uploaded, and observed-public states
separately.

Destination leaves may use a vendor name because explicit routing and consent are safer than an
ambiguous generic exporter. Vendor names never enter canonical knowledge, Publication domain types, or
the parent contract.

## Consequences

- New destinations add a leaf skill and connector without expanding the parent or domain model.
- People can invoke either the simple parent journey or a precise destination workflow.
- Destination-specific authentication and failure handling stay isolated and testable.
- Multi-destination publication can partially succeed; aggregate results preserve each independent state.
- Shared policy still belongs to Publication ports, so leaf skills cannot weaken release authority,
  disclosure, credential isolation, or audit rules.

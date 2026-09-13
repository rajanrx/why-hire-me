---
id: dom-evidence-acquisition
status: draft
date: 2026-09-13
prd_goals: [G-1, G-2, G-5, G-6]
---

# Evidence Acquisition

## Purpose

Capture authorised material from any profession or source while preserving origin, integrity,
scope, and permissions.

## Owns

- source definition and source connection;
- capture request, import run, snapshot, and source revision;
- connector capability and health metadata;
- capture consent, scope, and diagnostics;
- handoff of immutable snapshots to Knowledge Enrichment.

It does not interpret a person, create canonical claims, or publish knowledge.

## Core rules

1. Every capture identifies its source, requesting person, connector, time, and granted scope.
2. A snapshot is immutable or tamper-evident and has a stable digest.
3. Connector credentials are references to secrets, never source content or knowledge.
4. Capture is idempotent for the same source revision and configuration.
5. Local tools declare paths and permissions before reading; they do not silently broaden scope.
6. Following a link creates a new traceable capture, not an unrecorded network side effect.
7. Unsupported, failed, and partial captures are explicit outcomes.

## Example adapters

- résumé or portfolio file reader;
- local filesystem and Git/source-code inspector;
- public URL and certification verifier;
- document, project-management, creative-work, research, or professional-system connector.

These examples do not change the domain model.

Application and connector boundaries are defined in [`ports.md`](./ports.md).

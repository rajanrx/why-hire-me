---
id: dom-publication
status: draft
date: 2026-09-13
prd_goals: [G-2, G-5, G-7]
---

# Publication

## Purpose

Turn an authorised knowledge view into a versioned release and deliver it through replaceable
output connectors.

## Owns

- publication request, release, manifest, and release status;
- destination definition and delivery attempt;
- projection format and compatibility metadata;
- synchronisation checkpoint, public locator, and observed visibility;
- retraction and revocation propagation attempts.

It does not own canonical person knowledge, destination credentials, or an external platform's
sharing policy.

## Core rules

1. A release is built only from a versioned, authorised view.
2. The vendor-neutral release exists before any destination projection.
3. Every delivery identifies the release, connector version, destination, and result.
4. Delivery is idempotent and safe to resume.
5. Credentials are obtained at runtime through a credential port and never enter release content.
6. “Uploaded”, “shared”, and “publicly reachable” are different states.
7. A destination's inability to delete public copies is disclosed before publication.

## Example output adapters

- GitHub Release bundle publisher;
- NotebookLM source synchroniser;
- hosted web experience;
- downloadable archive;
- API or MCP knowledge server.

Application and destination boundaries are defined in [`ports.md`](./ports.md).

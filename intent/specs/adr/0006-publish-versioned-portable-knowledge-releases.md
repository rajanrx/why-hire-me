---
id: adr-0006
status: accepted
date: 2026-09-13
owner: architecture
---

# ADR-0006: Publish versioned, portable knowledge releases

## Context

People and agents need a stable shareable artefact. GitHub Releases and NotebookLM are useful
destinations, but they have different formats, authentication, sharing, and lifecycle behaviour.

## Decision

Publication first creates a vendor-neutral, immutable knowledge release from an authorised view.
Destination adapters then deliver projections of that release.

A release contains a manifest, schema version, release identity, view/version identity, generation
time, content digests, typed knowledge, permitted evidence, provenance, and human-readable entry
points. It never contains connector credentials.

- A GitHub adapter may upload the bundle as a release asset.
- A NotebookLM adapter may generate supported source documents and synchronise them to a notebook.
- A query adapter may let an agent download or query the release through a documented protocol.

Authentication is supplied through a `CredentialProvider` port. Environment variables are one
possible local adapter, not the contract. Public visibility is destination state and must be
observed separately from successful upload.

## Consequences

- One release can feed many destinations consistently.
- Recipients can cite and reproduce the exact knowledge version used.
- Revocation cannot guarantee deletion of already-downloaded public releases; the product must make
  that boundary explicit before publication.
- Destination limitations and synchronisation state must be recorded per delivery.

## References

- [GitHub release assets API](https://docs.github.com/en/rest/releases/assets)
- [Gemini Notebook Enterprise notebook API](https://docs.cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs/api-notebooks)
- [Gemini Enterprise authentication](https://docs.cloud.google.com/gemini/enterprise/docs/authentication)

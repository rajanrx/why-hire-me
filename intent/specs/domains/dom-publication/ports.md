---
id: ports-publication
status: draft
version: 0.1.0
date: 2026-09-13
domain: dom-publication
---

# Publication — Ports

## Driving ports

| Use case | Result |
|---|---|
| `CreateRelease` | Immutable vendor-neutral release from a versioned authorised view |
| `ValidateRelease` | Schema, reference, digest, policy, and compatibility result |
| `DeliverRelease` | Idempotent delivery attempt to one destination |
| `ObserveDelivery` | Uploaded, synchronised, shared, public, failed, or unknown state |
| `RetractDelivery` | Destination retraction result and disclosed residual exposure |
| `GetRelease` | Release manifest and authorised content |

## Driven ports

| Port | Responsibility |
|---|---|
| `KnowledgeViewReader` | Read exactly one authorised view/version |
| `ReleaseRepository` | Atomically store immutable release bundles and digests |
| `ProjectionBuilder` | Create a destination-compatible representation without semantic mutation |
| `DestinationPublisher` | Upload, update, inspect, or retract a projection |
| `CredentialProvider` | Resolve destination credentials at runtime |
| `PublicationPolicy` | Check content, audience, purpose, and irreversibility before release |
| `PublicationEventSink` | Record release and delivery outcomes |

## Output connector contract

A connector declares its ID/version, supported projection formats, authentication mechanism,
delivery operations, visibility states, deletion/retraction limits, size/rate constraints, and
compatibility range.

Delivery consumes a release ID and projection; it never reads canonical storage directly. Success
returns the destination identity, remote version where available, observed visibility, content
digest or equivalence evidence, and next synchronisation token.

“Uploaded”, “shared”, and “public” are different states. An adapter must not infer visibility from
a successful upload response.

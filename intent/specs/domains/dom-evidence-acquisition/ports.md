---
id: ports-evidence-acquisition
status: draft
version: 0.1.0
date: 2026-09-13
domain: dom-evidence-acquisition
---

# Evidence Acquisition — Ports

Ports use domain types. Connector-specific request and response models stay in adapters.

## Driving ports

| Use case | Result |
|---|---|
| `RegisterSource` | Source identity and required authorisation |
| `ConnectSource` | Revocable source connection referencing credentials |
| `CaptureSource` | Import run and zero or more immutable snapshots |
| `RefreshSource` | Snapshots for source revisions not already captured |
| `FollowReference` | Traceable capture linked to the referring evidence |
| `DisconnectSource` | Connection revoked; retention effects reported |
| `GetCaptureStatus` | Complete, partial, failed, cancelled, or unsupported status |

Every command carries knowledge-space ID, actor, purpose, permission scope, idempotency key, and
correlation ID.

## Driven ports

| Port | Responsibility |
|---|---|
| `SourceReader` | Describe capabilities and read only authorised source material |
| `SnapshotRepository` | Store and resolve immutable content by ID and digest |
| `CredentialProvider` | Resolve a credential reference at runtime without exposing it to the domain |
| `SourcePolicy` | Decide whether a source, path, reference, or media type may be captured |
| `MalwareAndContentScanner` | Report unsafe content without interpreting domain meaning |
| `AcquisitionEventSink` | Record durable outcomes and diagnostics |

## Input connector contract

A connector declares:

- stable connector ID and version;
- supported source and media types;
- configuration schema without secret values;
- required permissions and possible side effects;
- incremental capture and deletion capabilities;
- rate, size, and locality constraints; and
- health and compatibility information.

Capture returns content, media type, origin locator, source revision, capture time, digest, parent
reference where applicable, and explicit partial/failure diagnostics.

Retries with the same idempotency key and source revision must not duplicate snapshots.

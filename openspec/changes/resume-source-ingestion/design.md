## Context

The repository currently creates person profiles through a TypeScript application service and a
SQLite repository port. Evidence Acquisition is documented but has no implementation. See
`intent.yaml` for the durable constraints and the source-ingestion delta for observable behaviour.

## Goals / Non-Goals

**Goals:**

- Implement a complete capture path without bypassing domain-owned ports.
- Keep snapshot bytes immutable and metadata queryable.
- Make capture retry-safe for an unchanged source revision.

**Non-Goals:**

- Parse PDF, DOCX, Markdown, or other formats.
- Extract entities or claims.
- Recursively inspect a directory or repository.
- Use Go before profiling identifies a justified hot path.

## Decisions

### Domain-owned capture orchestration

Add `CaptureSource` in Evidence Acquisition. It depends on `SourceReader`, `SnapshotRepository`, and
capture-metadata repository ports. Local filesystem, content-addressed files, and SQLite implement
those ports outside the domain.

Alternative: let the CLI write files and database rows directly. Rejected because it would make
capture policy and idempotency adapter-specific.

### Stream once into content-addressed storage

The local reader resolves the explicitly supplied path, verifies it is a regular file, and exposes
its bytes. The snapshot adapter streams those bytes into a private temporary file while calculating
SHA-256 and byte length, then atomically renames it to a digest-derived path. Existing digest paths
are reused.

Alternative: load the whole file into memory. Rejected because file size should not determine core
memory consumption.

### Separate immutable bytes from capture metadata

Snapshot bytes live below the configured local data directory. SQLite stores source identity,
snapshot identity, provenance, status, and diagnostics. A completed metadata transaction occurs
only after the snapshot asset is durable. A crash may leave an unreferenced blob, which is safe and
can be garbage-collected later; it must not leave a completed row pointing to missing bytes.

### Idempotency follows source revision

The logical uniqueness key combines profile, resolved source locator, connector identity and
configuration, and content digest. A changed digest creates a new revision for the same source.

### No Go component in this change

The workload has no benchmark demonstrating a TypeScript bottleneck. The ports create a future seam
for a Go hashing or scanning worker without moving acquisition rules.

## Risks / Trade-offs

- **Filesystem and SQLite cannot share one transaction** → Persist bytes first and never commit a
  completed capture that references an absent snapshot.
- **Path resolution can hide a symbolic-link target** → Record both requested and resolved locators;
  authorisation applies to the explicitly supplied path for this single-file operation.
- **Opaque capture cannot answer résumé questions yet** → Keep parsing and enrichment as separate,
  reviewable changes.
- **Digest reuse reveals identical content within one local knowledge space** → Keep the store
  private by default and do not expose cross-profile digest lookup through the application port.

## Migration Plan

Add append-only acquisition tables through an idempotent SQLite migration. Existing profile rows
are unchanged. Rollback removes the new CLI surface and code; created snapshots and metadata remain
recoverable local data and are not deleted automatically.

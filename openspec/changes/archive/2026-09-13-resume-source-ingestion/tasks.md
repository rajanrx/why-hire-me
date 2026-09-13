## 1. Domain and ports

- [x] 1.1 RED: add tests for capture outcomes, provenance, and revision identity and verify they fail without Evidence Acquisition types.
- [x] 1.2 GREEN: implement the minimal capture entities and domain-owned ports and verify the domain tests pass.
- [x] 1.3 REFACTOR: extend the architecture-boundary test to cover Evidence Acquisition imports and verify adapters remain outside the domain.

## 2. Snapshot storage and metadata

- [x] 2.1 RED: add adapter tests for streamed SHA-256 storage, immutable reuse, changed content, and interrupted writes and observe the expected failures.
- [x] 2.2 GREEN: implement the content-addressed snapshot repository with private temporary files and atomic publication and verify its adapter tests pass.
- [x] 2.3 RED: add SQLite tests for capture provenance, failed outcomes, revision uniqueness, and missing-snapshot rejection and observe the expected failures.
- [x] 2.4 GREEN: add the idempotent acquisition migration and repository adapter and verify all SQLite tests pass.

## 3. Local source capture

- [x] 3.1 RED: add tests proving the reader accepts one explicit regular file and rejects missing paths, directories, and access outside the request.
- [x] 3.2 GREEN: implement the local-file reader and CaptureSource application service and verify unchanged retries reuse the logical snapshot.
- [x] 3.3 REFACTOR: keep requested and resolved locators distinct across the application and adapters and verify provenance round-trips unchanged.

## 4. CLI and integration

- [x] 4.1 RED: add CLI tests for successful capture and explicit failed diagnostics and observe the expected failures.
- [x] 4.2 GREEN: add `source ingest --profile <id> --file <path>` and verify it emits a structured capture result.
- [x] 4.3 Run `pnpm run check`, `pnpm run spec:validate`, and a temporary-database smoke test and record all commands passing.

## Why

The platform cannot build evidence-backed knowledge until it can capture material without losing
its origin or integrity. The first bounded step is to import one explicitly selected local file as
immutable evidence associated with an existing person profile.

## What Changes

- Add a local-file capture use case with an explicit, single-file permission scope.
- Preserve exact source bytes in content-addressed storage and record capture provenance in SQLite.
- Make repeated capture of the same file revision idempotent.
- Expose capture through the CLI with an observable completed or failed result.
- Treat all captured content as untrusted evidence.

Non-goals: parsing résumé formats, extracting semantic knowledge, asking AI questions, scanning
directories, following links, publishing evidence, or adding a Go accelerator.

## Capabilities

### New Capabilities

- `source-ingestion`: Authorised, immutable, and traceable capture of a local source file.

### Modified Capabilities

None.

## Impact

The change extends Evidence Acquisition, adds application and driven ports, adds local-file and
content-addressed-storage adapters, adds SQLite metadata, and adds a CLI command. It does not alter
the Person Knowledge schema or admit any semantic claim.

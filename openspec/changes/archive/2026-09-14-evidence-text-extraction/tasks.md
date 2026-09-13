## 1. Domain and application boundary

- [x] 1.1 RED: add tests for completed and failed extraction records, lineage, line locators, and stable artefact identity and verify they fail before implementation.
- [x] 1.2 GREEN: implement minimal Knowledge Enrichment extraction records and domain-owned ports and verify domain tests pass.
- [x] 1.3 GREEN: implement extraction orchestration tests for capture scope, extractor selection, idempotency, and failures and verify them passing.

## 2. Extraction and storage adapters

- [x] 2.1 RED: add UTF-8 extractor tests for supported extensions, chunk boundaries, BOM, line normalisation, invalid encoding, and unsupported formats and observe expected failures.
- [x] 2.2 GREEN: implement the deterministic text extractor and verify all adapter tests pass.
- [x] 2.3 RED: add repository integration tests for atomic storage, metadata lineage, reuse, and failed attempts and observe expected failures.
- [x] 2.4 GREEN: implement local derived-text and SQLite persistence adapters and verify repository integration tests pass.

## 3. CLI and integration

- [x] 3.1 RED: add CLI tests for extracting a captured text file, repeat reuse, wrong-profile rejection, and unsupported format diagnostics and observe expected failures.
- [x] 3.2 GREEN: add `evidence extract-text --profile <id> --capture <id>` and verify structured results contain citable lineage.
- [x] 3.3 REFACTOR: extend architecture-boundary coverage to Knowledge Enrichment and verify all adapters continue to depend inward.
- [x] 3.4 Run `pnpm run check`, a compiled CLI smoke test, and strict OpenSpec validation and verify all commands pass.

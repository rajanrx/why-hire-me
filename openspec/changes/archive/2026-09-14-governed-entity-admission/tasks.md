## 1. Admission core

- [x] 1.1 RED: add tests for outcomes, reviewer authority, ambiguity, terminal decisions, and retries.
- [x] 1.2 GREEN: add Person Knowledge proposal, decision, entity, activity, and admission use case contracts.

## 2. Persistence and translation

- [x] 2.1 RED: add SQLite integration tests for hidden foreign candidates and atomic accepted, rejected, and deferred writes.
- [x] 2.2 GREEN: implement staged-proposal translation and transactional canonical persistence.

## 3. CLI and release boundary

- [x] 3.1 RED: add an end-to-end CLI review test and release archive-content test.
- [x] 3.2 GREEN: expose `knowledge review-entity` and document the accepted workflow.
- [x] 3.3 Verify plugin-host namespacing and exclude development material from the release bundle.
- [x] 3.4 Run all checks, quick review, archive the OpenSpec change, and add a changeset.

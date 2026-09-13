## 1. Candidate domain and orchestration

- [x] 1.1 RED: add tests for supported entity types, required provenance, evidence ranges, and deterministic identity and observe failures before implementation.
- [x] 1.2 GREEN: implement the entity-candidate model and core-owned staging ports and verify domain tests pass.
- [x] 1.3 GREEN: implement staging orchestration and verify all evidence resolves before any candidate write.

## 2. Evidence and staging adapters

- [x] 2.1 RED: add adapter integration tests for same-profile evidence, hidden foreign evidence, line bounds, equivalent reuse, and append-only activities and observe failures.
- [x] 2.2 GREEN: implement SQLite text-evidence reading and candidate staging transactions and verify adapter integration tests pass.

## 3. CLI and integration

- [x] 3.1 RED: add an end-to-end CLI test from text capture through entity staging, including invalid evidence and retry cases.
- [x] 3.2 GREEN: add `knowledge stage-entity` with explicit type, name, evidence, generator, uncertainty, review, policy, and correlation inputs and verify structured output.
- [x] 3.3 REFACTOR: verify Knowledge Enrichment retains inward dependencies and staged records have no canonical write path.
- [x] 3.4 Run `pnpm run check`, strict OpenSpec validation, plugin validation, and a compiled smoke test and verify all pass.

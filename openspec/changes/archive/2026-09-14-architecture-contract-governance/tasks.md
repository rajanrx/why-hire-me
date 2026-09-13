## 1. Bounded-context conformance

- [x] 1.1 RED: strengthen architecture tests to reject cross-domain production imports and verify the current acquisition imports fail.
- [x] 1.2 GREEN: add the acquisition-owned knowledge-space resolver port, remove Person Knowledge imports, and verify capture behaviour remains unchanged.
- [x] 1.3 REFACTOR: compose the profile lookup at the CLI edge and verify all production domain imports resolve within their owner.

## 2. Predicate registry

- [x] 2.1 RED: add tests for registry metadata, unique immutable entries, exact lookup, valid pairs, reversed pairs, and unknown predicates.
- [x] 2.2 GREEN: implement registry version `0.1.0` with the governed initial predicates and verify every standard entry matches code.
- [x] 2.3 REFACTOR: expose no mutation API and verify registry definitions and nested type collections are frozen.

## 3. Verification

- [x] 3.1 Run `pnpm run check`, strict OpenSpec validation, plugin validation, and capture smoke tests and verify all pass.

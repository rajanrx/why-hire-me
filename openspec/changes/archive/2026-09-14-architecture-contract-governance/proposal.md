## Why

Layer-only checks still allow bounded contexts to couple through imports, and future claim
generation has no executable source of valid relationship meaning. Both gaps would let domain
boundaries drift as new AI and connector adapters arrive.

## What Changes

- Enforce that production modules inside one domain never import another domain, adapter, or app.
- Replace Evidence Acquisition's Person Knowledge imports with an acquisition-owned capability port.
- Add a versioned, immutable registry for controlled predicates and allowed entity-type pairs.
- Reject unknown, inactive, or type-incompatible predicates through a domain API.

Non-goals: claim staging, admission, predicate editing at runtime, external ontology mapping,
shared-kernel creation, microservices, or Go components.

## Capabilities

### New Capabilities

- `domain-dependency-conformance`: Enforce bounded-context and hexagonal import rules.
- `predicate-registry`: Resolve and validate versioned Person Knowledge predicates.

### Modified Capabilities

None.

## Impact

Adds architecture and predicate conformance tests, refactors the capture profile check behind an
owned port, and introduces a dependency-free Person Knowledge registry module.

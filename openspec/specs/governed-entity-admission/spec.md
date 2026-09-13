# governed-entity-admission Specification

## Purpose
Move a reviewed, evidence-linked entity proposal into canonical person knowledge only after
explicit authority, ambiguity, policy, provenance, and lifecycle checks pass.

## Requirements

### Requirement: Explicit reviewed outcome

The system SHALL record an `accepted`, `rejected`, or `deferred` decision with candidate,
knowledge-space, reviewer, authority, reason, time, correlation, and idempotency information.

#### Scenario: Candidate is deferred

- **WHEN** an authorised reviewer defers a staged candidate with a reason
- **THEN** the decision and admission activity are recorded without canonical entity creation

### Requirement: Canonical writes require acceptance

The system MUST create a canonical entity only for an accepted candidate and SHALL commit the
entity, decision, and admission activity atomically.

#### Scenario: Candidate is accepted

- **WHEN** a valid candidate passes reviewer, policy, and ambiguity checks
- **THEN** one canonical entity links to its generating admission activity

#### Scenario: Candidate is rejected

- **WHEN** a reviewer rejects a candidate
- **THEN** no canonical entity is created

### Requirement: Review and ambiguity checks fail closed

The system SHALL require the candidate's declared review authority and explicit resolution of any
possible duplicates or conflicts before acceptance.

#### Scenario: Acceptance leaves ambiguity unresolved

- **WHEN** an accepted proposal has duplicate or conflict hints without the required resolution
- **THEN** the request fails without recording a decision or entity

#### Scenario: Candidate is unavailable across a boundary

- **WHEN** a candidate is missing or belongs to another knowledge space
- **THEN** the system returns the same unavailable error and writes nothing

### Requirement: Decisions are safely repeatable

The system SHALL return the original result for an identical retry, reject changed input using the
same idempotency key, and prevent a later decision after acceptance or rejection.

#### Scenario: Accepted request is retried

- **WHEN** the same material request and idempotency key are submitted again
- **THEN** the original entity, activity, and decision are returned without duplicate records

#### Scenario: Deferred candidate is reconsidered

- **WHEN** a candidate has only deferred decisions
- **THEN** a later request with a new idempotency key may accept, reject, or defer it

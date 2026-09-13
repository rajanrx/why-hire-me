# authorised-knowledge-view Specification

## Purpose
Define a person-confirmed, purpose-bound immutable view over accepted knowledge.

## Requirements

### Requirement: Disclosure authority is explicit and expiring

The system SHALL require profile, purpose, audience, expiry, reviewer, allowed policy labels, and
explicit confirmation and MUST reject expired or non-person authority.

#### Scenario: Confirmation is absent

- **WHEN** view creation is requested
- **THEN** no grant or view is persisted

### Requirement: Views contain only allowed accepted records

The system SHALL select active accepted canonical entities and their admission activities whose policy
labels are all allowed and MUST report excluded counts without exposing excluded content.

#### Scenario: A private entity is not allowed

- **WHEN** the view is frozen
- **THEN** that entity and its activity are absent and the exclusion count increases

### Requirement: Views are immutable, versioned, and idempotent

The system SHALL sort records by stable ID, assign a monotonic profile view version, and return an
identical view for an identical idempotency retry.

#### Scenario: An idempotency key is reused with changed policy

- **WHEN** the request is evaluated
- **THEN** the system returns a conflict without changing the stored view

## ADDED Requirements

### Requirement: Curation has explicit authority and scope

The skill SHALL confirm knowledge space, purpose, privacy, reviewer authority, and a bounded candidate
queue and MUST NOT infer authority from access.

#### Scenario: A person requests cleanup of everything

- **WHEN** no bounded queue or filter is supplied
- **THEN** the skill helps define a small queue before reviewing candidates

### Requirement: Review is ordered and complete

The skill SHALL check source authority, provenance, semantics, identity, conflicts, uncertainty,
policy, freshness, and durable value in safety and dependency order.

#### Scenario: A claim depends on an unresolved organisation

- **WHEN** the organisation identity remains ambiguous
- **THEN** the dependent claim is deferred until identity is resolved

### Requirement: Semantic structure is protected

The skill SHALL use controlled entity and predicate registries and MUST NOT silently merge identities,
flatten contextual relationships, invent predicates, or delete conflicting history.

#### Scenario: Two organisation names may be aliases

- **WHEN** evidence cannot establish one identity
- **THEN** the candidates remain distinct or deferred rather than silently merged

### Requirement: AI recommendation has no admission authority

The skill SHALL separate recommendation, explicit human disposition, and admission result and MUST NOT
treat silence or conversational approval as a governed decision.

#### Scenario: The AI recommends acceptance

- **WHEN** the authorised reviewer has not supplied a disposition
- **THEN** no admission call occurs and the result remains not applied

### Requirement: Application uses public admission ports

The skill SHALL apply only an authorised human's explicit accept, reject, or defer decision through
the public admission interface and SHALL verify the returned state.

#### Scenario: An admission call fails

- **WHEN** the port does not confirm the requested result
- **THEN** the review records failure and does not claim a canonical change

### Requirement: Preview mode is inert

The skill SHALL use `review-preview` when required tools or authority are unavailable and SHALL mark
every recommendation `not-applied`.

#### Scenario: Candidate evidence cannot be loaded

- **WHEN** a complete review cannot be performed
- **THEN** the skill reports the blocker without changing canonical knowledge

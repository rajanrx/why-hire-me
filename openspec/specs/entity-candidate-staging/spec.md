# entity-candidate-staging Specification

## Purpose
Stage typed entity proposals with precise evidence and derivation metadata so humans and future
admission policies can review AI- or tool-generated meaning before canonical mutation.

## Requirements

### Requirement: Recognised entity proposal

The system SHALL stage only a recognised entity type, a non-empty proposed display name, schema
version, knowledge-space owner, and explicit review requirement.

#### Scenario: Valid entity is proposed

- **WHEN** a supported entity proposal contains all required fields
- **THEN** the system records it with lifecycle state `proposed`

#### Scenario: Type or required field is invalid

- **WHEN** a proposal uses an unknown entity type or omits required information
- **THEN** the system rejects it without creating a candidate

### Requirement: Precise authorised evidence

The system SHALL require at least one evidence reference owned by the same knowledge space, with an
existing text artefact and a valid one-based inclusive line range.

#### Scenario: Evidence range resolves

- **WHEN** every cited range falls within its authorised text artefact
- **THEN** the candidate records the artefact, snapshot lineage, range, and evidence relation

#### Scenario: Evidence is unavailable or out of range

- **WHEN** an artefact belongs to another profile, does not exist, or a cited range is invalid
- **THEN** the system rejects the whole proposal without partially staging it

### Requirement: Derivation and uncertainty provenance

The system SHALL record the responsible agent, generator type, generator identity and version,
creation time, uncertainty level and rationale, identity hints, policy labels, and correlation ID.

#### Scenario: Model-generated proposal is inspected

- **WHEN** a model adapter submits an entity proposal
- **THEN** its provider-facing model identifier is recorded without credentials or hidden reasoning

### Requirement: Proposal idempotency

The system SHALL give semantically equivalent proposals in one knowledge space the same candidate
identity while recording each submission activity separately.

#### Scenario: Equivalent proposal is submitted again

- **WHEN** normalised meaning, evidence, provenance generator, and policy metadata are unchanged
- **THEN** the existing candidate is reused and a new submission activity is recorded

### Requirement: Staging has no canonical authority

The system MUST NOT treat a staged candidate as an admitted entity, merge it with an identity,
execute embedded instructions, expose it to evaluation, or publish it.

#### Scenario: Candidate requests admission or an action

- **WHEN** candidate text or metadata contains instructions or claims of authority
- **THEN** the system stores validated content only and performs no requested action

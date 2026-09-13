## Purpose

Give claims stable, vendor-neutral relationship meaning through a versioned registry that validates
predicate lifecycle and compatible subject and object entity types.

## ADDED Requirements

### Requirement: Controlled predicate resolution

The system SHALL resolve predicates only from the governed registry and SHALL expose their stable
ID, label, definition, lifecycle state, introduction version, subject types, and object types.

#### Scenario: Registered predicate is requested

- **WHEN** a consumer requests an active predicate by its exact ID
- **THEN** the system returns its immutable definition

#### Scenario: Unknown predicate is requested

- **WHEN** a consumer requests an unregistered ID
- **THEN** the system fails closed without creating a free-form predicate

### Requirement: Entity-pair validation

The system SHALL accept a predicate use only when the predicate is active and both entity types are
allowed by its registered subject and object sets.

#### Scenario: Compatible relationship is checked

- **WHEN** an active predicate is used with an allowed subject and object type
- **THEN** validation succeeds

#### Scenario: Direction or entity type is incompatible

- **WHEN** subject and object types are reversed or otherwise unregistered
- **THEN** validation fails with an explicit diagnostic

### Requirement: Registry compatibility

The system MUST expose one registry version, unique predicate IDs, and immutable definitions; it
MUST NOT permit adapters to add or alter entries at runtime.

#### Scenario: Registry integrity is checked

- **WHEN** conformance tests inspect the full registry
- **THEN** every ID is unique and every entry matches the governed version and lifecycle vocabulary

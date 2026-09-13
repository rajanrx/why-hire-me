# output-github-release Specification

## Purpose
Define conflict-safe delivery of an authorised career release through a replaceable GitHub connector.

## Requirements

### Requirement: Exact assets are validated

The skill SHALL validate the authorised release manifest and every asset's name, size, media type, and
SHA-256 digest and MUST NOT rebuild or substitute content.

#### Scenario: An asset digest differs

- **WHEN** a release is planned
- **THEN** the workflow stops before contacting GitHub

### Requirement: Repository visibility constrains the audience

The skill SHALL observe repository visibility and MUST reject an audience or visibility that GitHub
release settings cannot represent.

#### Scenario: Restricted sharing is requested in a public repository

- **WHEN** preflight completes
- **THEN** the action is blocked rather than described as restricted

### Requirement: Mutation is draft-first and conflict-safe

The skill SHALL default to draft and conflict failure and MUST NOT move tags or overwrite assets
without a separately previewed and confirmed operation.

#### Scenario: A same-named asset has different bytes

- **WHEN** the destination is inspected
- **THEN** the result is conflict and no upload occurs

### Requirement: Confirmation is action-time and exact

The skill SHALL show repository, target, tag, settings, files, digests, credential-source name, and
limitations and SHALL require confirmation immediately before connector invocation.

#### Scenario: A draft exists

- **WHEN** making it non-draft is proposed
- **THEN** publishing requires a new confirmation

### Requirement: Results preserve remote states

The skill SHALL record release creation, per-asset upload, equivalence, and observed visibility
separately and MUST NOT infer publication from an accepted request.

#### Scenario: One asset upload fails

- **WHEN** other assets were accepted
- **THEN** the result is partial with each asset outcome retained

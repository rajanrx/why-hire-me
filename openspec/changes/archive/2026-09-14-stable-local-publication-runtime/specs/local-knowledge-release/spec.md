# local-knowledge-release Specification

## Purpose
Define an atomic, deterministic, vendor-neutral release that can be validated without the application.

## ADDED Requirements

### Requirement: Release input is one valid authorised view

Publication SHALL consume one unexpired immutable view and MUST NOT query canonical storage or include
grants and excluded records.

#### Scenario: The view has expired

- **WHEN** release creation begins
- **THEN** no output directory is committed

### Requirement: Release bytes are deterministic and atomic

The system SHALL serialise stable sorted NDJSON, hash every payload file, write into a private temporary
directory, and atomically rename the completed bundle.

#### Scenario: The same view is released twice

- **WHEN** the first valid bundle already exists
- **THEN** the second operation returns the same release without rewriting it

### Requirement: Validation is independent and fail-closed

The validator SHALL check manifest schema, safe relative paths, exact digests, byte sizes, record counts,
and line-delimited JSON using only the release directory.

#### Scenario: A payload byte changes

- **WHEN** validation runs
- **THEN** the release is invalid with a digest mismatch

### Requirement: Semantic coverage is not overstated

The manifest SHALL report record counts and limitations and MUST identify empty claim, evidence, and
alias families until supported admission paths exist.

#### Scenario: The release contains only entities

- **WHEN** a consumer reads the manifest
- **THEN** the entity-only limitation is explicit

# output-notebooklm-sync Specification

## Purpose
Define capability-aware, duplicate-safe career source synchronisation to NotebookLM.

## Requirements

### Requirement: Connector capability is explicit

The skill SHALL identify Enterprise API, manual handoff, or unsupported mode and MUST NOT infer an API
or credential method from the NotebookLM product name.

#### Scenario: Only a consumer account is available

- **WHEN** no documented connector capability is installed
- **THEN** the skill returns manual-handoff or unsupported without claiming synchronisation

### Requirement: Exact approved sources are validated

The skill SHALL validate manifest, source identity, title, type, size, digest, authority, and policy and
MUST NOT read canonical storage or unapproved evidence.

#### Scenario: A source has expired authority

- **WHEN** planning begins
- **THEN** no source is sent to the connector

### Requirement: Synchronisation is duplicate-safe

The skill SHALL reuse exact matches, block mismatches, and SHALL add and verify a replacement before any
separately confirmed removal of its predecessor.

#### Scenario: A title matches but content differs

- **WHEN** remote sources are inspected
- **THEN** the proposed operation is conflict rather than overwrite

### Requirement: Sharing is independent

The skill SHALL preserve the observed notebook visibility and MUST NOT share a notebook or infer public
access from successful source processing.

#### Scenario: All sources complete

- **WHEN** synchronisation is verified
- **THEN** notebook sharing remains unchanged and separately reported

### Requirement: Results preserve processing truth

The skill SHALL report every source's accepted, processing, complete, failed, and equivalence state and
MUST keep derived NotebookLM outputs outside canonical career knowledge.

#### Scenario: One source fails processing

- **WHEN** other sources complete
- **THEN** the overall result is partial with independent source outcomes

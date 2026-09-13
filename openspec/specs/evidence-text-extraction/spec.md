# evidence-text-extraction Specification

## Purpose
Produce deterministic, citable text artefacts from supported captured evidence while preserving
lineage and preventing derived content from becoming trusted or canonical automatically.

## Requirements

### Requirement: Extraction requires completed captured evidence

The system SHALL extract text only from a completed capture associated with the requested person
profile or knowledge space.

#### Scenario: Completed capture is selected

- **WHEN** text extraction is requested for a completed capture in the requested profile
- **THEN** the system reads only that capture's immutable snapshot

#### Scenario: Capture is unavailable or failed

- **WHEN** the requested capture does not exist, belongs to another profile, or has failed
- **THEN** the system rejects extraction without creating a text artefact

### Requirement: Deterministic supported-format extraction

The system SHALL decode supported plain-text evidence deterministically as valid UTF-8, normalise
line endings to LF, and preserve all other textual content.

#### Scenario: Supported text is valid

- **WHEN** a completed plain-text or Markdown snapshot contains valid UTF-8
- **THEN** the resulting artefact contains its text with deterministic LF line endings

#### Scenario: Format or encoding is unsupported

- **WHEN** the selected snapshot has an unsupported format or invalid UTF-8
- **THEN** the system reports an explicit failed extraction and creates no completed artefact

### Requirement: Citable extraction lineage

The system SHALL record the profile, requested capture, extraction time, and explicit outcome for
every extraction attempt. When captured evidence resolves, it SHALL also record snapshot identity
and digest, extractor identity and version, output digest, and line count as applicable.

#### Scenario: Extracted text is inspected

- **WHEN** a completed text artefact is retrieved
- **THEN** each line can be addressed using its artefact identity and one-based line number and its
  lineage resolves to the captured snapshot

#### Scenario: Extraction fails

- **WHEN** extraction cannot decode or durably store its result
- **THEN** the attempt records an explicit failure code and safe diagnostic without a completed
  artefact

### Requirement: Extraction is revision-idempotent

The system SHALL reuse the same logical text artefact when the snapshot, extractor identity,
extractor version, configuration, and extracted output are unchanged.

#### Scenario: Same snapshot is extracted again

- **WHEN** the same snapshot is processed by the same extractor configuration more than once
- **THEN** completed attempts identify the same text artefact without duplicating stored text

#### Scenario: Extractor or snapshot changes

- **WHEN** the snapshot content or extractor version or configuration changes
- **THEN** the system creates a distinct text artefact identity

### Requirement: Extracted content remains untrusted evidence

The system MUST treat extracted text as derived evidence and MUST NOT execute its instructions,
grant permissions, create canonical claims, or publish it automatically.

#### Scenario: Extracted text contains instructions

- **WHEN** extracted text requests tool access, knowledge admission, or publication
- **THEN** the system preserves it as content without performing the requested action

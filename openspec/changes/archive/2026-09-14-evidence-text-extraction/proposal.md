## Why

Captured snapshots are traceable but cannot yet be inspected or cited as text. The platform needs
a deterministic enrichment boundary before AI exploration can safely derive candidate knowledge.

## What Changes

- Extract reviewable text from supported captured snapshots without creating canonical knowledge.
- Preserve extraction provenance and stable line-based evidence locators.
- Reuse an existing extraction when the snapshot and extractor version are unchanged.
- Report unsupported formats and invalid text explicitly.

Non-goals: PDF or DOCX parsing, OCR, AI inference, semantic entity or claim extraction, admission,
recursive source inspection, or publication.

## Capabilities

### New Capabilities

- `evidence-text-extraction`: Deterministic, citable text artefacts derived from captured evidence.

### Modified Capabilities

None.

## Impact

Adds Knowledge Enrichment domain contracts, a deterministic plain-text extractor, local derived
artefact storage, SQLite metadata, and a CLI command. It introduces no model or vendor dependency.

## Why

The platform needs a safe way for a person or visitor to explore shared career knowledge. Generic AI
Q&A can leak private sources, ignore view versions, overstate integrity checks, and interpret missing
information as lack of experience.

## What Changes

- Add `output-career-knowledge-guide` for read-only Q&A over one authorised view or supplied release.
- Validate integrity and freshness without equating release validation with claim truth.
- Classify supported, qualified, absent, withheld, stale, and conflicting answers explicitly.
- Preserve answer provenance and prevent expansion into hidden knowledge or evaluation.
- Add an example and update discovery and bundle assertions to seven skills.

Non-goals: knowledge mutation, view creation, publication, external research, hidden evaluation,
scoring, or disclosure-policy override.

## Capabilities

### New Capabilities

- `output-career-knowledge-guide`: Evidence-linked Q&A within an authorised career knowledge boundary.

### Modified Capabilities

- `plugin-distribution`: One-command discovery includes seven available skills.

## Impact

The change adds an output skill, answer contract, example, package assertions, and documentation
status changes. It introduces no vendor or persistence dependency.

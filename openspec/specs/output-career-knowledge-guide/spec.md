# output-career-knowledge-guide Specification

## Purpose
Define safe, evidence-linked career Q&A over one authorised, versioned view or portable release
without expanding access, mutating knowledge, or converting missing information into judgement.

## Requirements

### Requirement: Q&A has an authorised boundary

The skill SHALL confirm audience, purpose, and one exact authorised view or supplied release and MUST
NOT fall back to private sources, memory, or external research.

#### Scenario: A visitor asks about information outside the view

- **WHEN** the authorised projection cannot answer
- **THEN** the result is `not-in-view` without broader retrieval

### Requirement: Release validation is explicit

The skill SHALL report validated, partially validated, unvalidated, or invalid state from available
schema, integrity, publisher, version, freshness, expiry, and evidence checks.

#### Scenario: A checksum fails

- **WHEN** a required integrity check is invalid
- **THEN** factual Q&A stops and the result identifies an invalid view

### Requirement: Answer classes preserve meaning

The skill SHALL distinguish supported, qualified, not-in-view, withheld, stale, and conflicting
results and MUST NOT interpret missing or withheld information as lack of experience.

#### Scenario: Policy excludes a relevant record

- **WHEN** the view does not permit its disclosure
- **THEN** the answer is withheld without revealing hidden details

### Requirement: Material claims are evidence-linked

The skill SHALL separate facts, attributed statements, observations, and interpretation and SHALL
cite allowed record IDs and safe evidence locators for each material claim.

#### Scenario: An answer summarises a contribution

- **WHEN** the view supports the summary
- **THEN** the answer includes its record links, material uncertainty, time, and scope

### Requirement: The guide is read-only

The skill MUST NOT add knowledge, admit corrections, widen a view, publish content, contact another
party, or claim delivery from an attempted action.

#### Scenario: The owner reports an error

- **WHEN** a correction is needed
- **THEN** the guide proposes a separate curation workflow and preserves the original answer version

### Requirement: Evaluation requests are separated

The skill SHALL refuse hidden scoring, ranking, protected-trait inference, or hiring judgement and may
route an explicitly authorised assessment to the separate evaluation workflow.

#### Scenario: A visitor asks whether the person should be hired

- **WHEN** no formal evaluation context exists
- **THEN** the guide offers factual evidence from the view without a recommendation

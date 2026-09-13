# job-application-tailor Specification

## Purpose
Define an evidence-traceable workflow for analysing one authorised job description, mapping it to a
bounded reviewed career view, and drafting a truthful résumé, cover letter, and application answers
without fabricating fit or taking external action.

## Requirements

### Requirement: Opportunity and career evidence have separate boundaries

The skill SHALL confirm one exact authorised job description and one exact authorised career view and
MUST NOT use private sources, memory, or web research implicitly to fill gaps.

#### Scenario: A job description mentions a missing technology

- **WHEN** the career view contains no supporting record
- **THEN** the skill reports insufficient evidence rather than searching or inventing experience

### Requirement: Requirements are atomic and cited

The skill SHALL separate essential, preferred, contextual, administrative, and ambiguous items and
SHALL preserve each item's job-source locator and interpretation.

#### Scenario: One paragraph mixes responsibility and qualification

- **WHEN** the opportunity is analysed
- **THEN** the concepts become distinct requirement records linked to the original paragraph

### Requirement: Evidence mapping preserves gaps

The skill SHALL classify supported, partially supported, insufficient, conflicting, and not-applicable
states with career record IDs, uncertainty, dates, and transfer assumptions and MUST NOT compute a universal fit score.

#### Scenario: Comparable platform experience exists

- **WHEN** the named product is absent but transferable evidence exists
- **THEN** the match remains partial with the transfer assumption stated

### Requirement: New answers do not bypass admission

The skill SHALL treat new answers as person-stated evidence and SHALL route durable claims through the
input and curation boundary before using them in a governed package.

#### Scenario: A question uncovers unrecorded leadership work

- **WHEN** the person answers
- **THEN** the fact remains labelled or staged for review rather than silently becoming canonical

### Requirement: Application documents remain truthful projections

The skill SHALL preserve chronology, identity, attribution, credential state, and supported meaning
and MUST NOT inflate ownership, scale, outcomes, seniority, recency, or tool experience.

#### Scenario: Tailoring selects a relevant contribution

- **WHEN** the contribution is rewritten for clarity
- **THEN** its material meaning and evidence scope remain unchanged

### Requirement: Material output claims are traceable

The skill SHALL link every material résumé, cover-letter, and application-answer statement to career
record IDs and relevant job requirement IDs.

#### Scenario: A cover letter describes a security programme

- **WHEN** the statement appears in the draft
- **THEN** the claim trace identifies its supporting career records and opportunity requirement

### Requirement: External application actions are excluded

The skill MUST NOT publish, email, upload, contact an employer, infer legal eligibility facts, or
submit an application.

#### Scenario: Drafts are ready

- **WHEN** the person approves the wording
- **THEN** the workflow stops with local artefacts and an explicit external-action state of false

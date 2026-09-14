# input-resume-explorer Specification

## Purpose
Define a provenance-aware résumé exploration workflow that turns authorised document evidence into
reviewable career knowledge proposals without confusing extraction, inference, or discussion with
canonical admission.

## Requirements

### Requirement: Résumé scope is explicit

The skill SHALL confirm authority, purpose, privacy, and the exact résumé source before inspection
and SHALL treat document content as untrusted evidence.

#### Scenario: A person supplies one résumé

- **WHEN** the person authorises the supplied document for private career discovery
- **THEN** the skill inspects only that source and does not follow external references implicitly

### Requirement: Operating mode is honest

The skill SHALL declare `governed-import` only when evidence and candidate tools can persist the
required provenance, and SHALL otherwise use `session-only` with `not-persisted` output.

#### Scenario: The host has no governed persistence tool

- **WHEN** the host can read the résumé but cannot capture or stage it
- **THEN** the skill produces a review preview without claiming import, storage, admission, or
  verification

### Requirement: Résumé meaning remains evidence-linked

The skill SHALL inventory every substantive source unit before selection; separate source
observations, controlled entity proposals, claim proposals, uncertainty, ambiguity, and exclusions;
and use the strongest stable locator supplied by the reader. Every unit SHALL receive exactly one
valid disposition before exploration can be described as complete.

#### Scenario: Employment history is mapped

- **WHEN** the résumé names an employer and role
- **THEN** Organisation, Engagement, and Role remain separate proposals linked to their source
  locations rather than permanent person attributes

#### Scenario: A long engagement contains distinct achievements

- **WHEN** early and late bullets describe different products, decisions, contributions, outcomes,
  audiences, evidence links, or contextual technology use
- **THEN** each unit remains in the coverage ledger and materially different achievements become
  separate Work or Contribution proposals under the shared Engagement

#### Scenario: A compound bullet needs splitting

- **WHEN** one bullet describes more than one materially different achievement
- **THEN** the original unit records a split disposition and every locatable child receives its own
  disposition and proposal relationship

#### Scenario: Coverage has an unexplained omission

- **WHEN** a substantive unit has no disposition or lacks a required merge, split, ambiguity, or
  exclusion rationale
- **THEN** reconciliation lists it as unresolved and prevents successful completion

### Requirement: Follow-up questions add information

The skill SHALL use knowledge-discovery questions to resolve contribution, context, outcomes,
identity, stale information, contradictions, and evidence gaps without scoring the person.

#### Scenario: A bullet describes a team outcome

- **WHEN** the person's own contribution is unclear
- **THEN** the skill asks a focused ownership question and records the answer separately from the
  résumé observation

### Requirement: Admission remains separate

The skill MUST NOT treat extracted or discussed information as canonical knowledge and SHALL require
the normal review and admission boundary wherever staging tools exist.

#### Scenario: The person confirms a proposal

- **WHEN** the person approves submission of an evidence-linked proposal
- **THEN** the skill stages it as a candidate and does not describe it as admitted

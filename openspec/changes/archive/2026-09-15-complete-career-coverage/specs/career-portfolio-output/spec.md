## MODIFIED Requirements

### Requirement: Portfolio communicates evidence-backed career knowledge

The portfolio SHALL provide a career overview, navigable knowledge graph, readable and printable
résumé, evidence references, limitations, freshness, release identity, and an inclusion decision for
every authorised Work, Contribution, and reported outcome. The exact preview SHALL show the complete
inclusion map before person approval. In release schema 0.1, a reported-outcome Claim SHALL identify
itself with `data.claimType: reported-outcome` so the projection can include it without interpreting
free text.

#### Scenario: A visitor follows a career statement

- **WHEN** a displayed factual statement has permitted supporting evidence
- **THEN** the visitor can navigate to its safe evidence reference and provenance

#### Scenario: The graph is inaccessible or unsuitable

- **WHEN** a visitor uses a keyboard, assistive technology, print, or a narrow screen
- **THEN** equivalent career information remains available without depending on graph interaction

#### Scenario: One engagement contains several achievements

- **WHEN** the release contains several distinct achievements associated with one employer or role
- **THEN** each receives a featured, supporting, summarised, excluded, or deferred decision and an
  employer-level summary cannot silently replace it

#### Scenario: Inclusion coverage is incomplete

- **WHEN** any eligible achievement has a missing, duplicate, invalid, or deferred decision
- **THEN** generation fails and reports the unresolved achievement identifiers

#### Scenario: A visitor explores technical context

- **WHEN** explicit release relationships connect work, contributions, technologies, and evidence
- **THEN** a light-first interface lets keyboard and pointer users select nodes and inspect contextual
  detail, with a searchable record explorer and complete relationship list as equivalent paths

#### Scenario: Relationships are absent

- **WHEN** the release contains no explicit claim relationship for displayed records
- **THEN** the portfolio states the limitation and does not imply relationships with decorative lines

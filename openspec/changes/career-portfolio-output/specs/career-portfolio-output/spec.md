## ADDED Requirements

### Requirement: Offline portfolio comes from an authorised release

The system SHALL build a career portfolio only from one validated, immutable, authorised knowledge
release and MUST NOT read canonical storage from the renderer or destination adapter.

#### Scenario: A person creates a local portfolio

- **WHEN** the person selects an authorised release and requests the portfolio projection
- **THEN** the renderer creates a versioned static output that can be opened without an account

### Requirement: Portfolio communicates evidence-backed career knowledge

The portfolio SHALL provide a career overview, navigable knowledge graph, readable and printable
résumé, evidence references, limitations, freshness, and release identity.

#### Scenario: A visitor follows a career statement

- **WHEN** a displayed factual statement has permitted supporting evidence
- **THEN** the visitor can navigate to its safe evidence reference and provenance

#### Scenario: The graph is inaccessible or unsuitable

- **WHEN** a visitor uses a keyboard, assistive technology, print, or a narrow screen
- **THEN** equivalent career information remains available without depending on graph interaction

### Requirement: Static output is private and portable by default

The portfolio SHALL contain its required assets locally, escape untrusted content, avoid analytics
and remote dependencies, and render deterministically for the same release and renderer version.

#### Scenario: A portfolio is opened offline

- **WHEN** the generated files are opened without a network connection
- **THEN** the overview, graph, résumé, evidence references, and styling remain usable

### Requirement: Hosted delivery is optional and explicit

Every hosted-platform adapter SHALL consume the completed portfolio projection, obtain credentials
at runtime, show the selected destination and intended visibility, require confirmation, and
record upload and observed public state separately.

#### Scenario: A person publishes a portfolio

- **WHEN** the person signs in, chooses a supported destination, previews the exact projection, and
  confirms delivery
- **THEN** the adapter publishes those files and returns a recorded destination address and observed
  visibility

#### Scenario: Hosting is unavailable or over plan limits

- **WHEN** the selected platform refuses authentication or deployment
- **THEN** delivery fails without changing the authorised release or offline portfolio

### Requirement: AI coordination cannot grant publication authority

The planned `career-portfolio` skill SHALL help select, explain, preview, and generate a portfolio
but MUST NOT approve a view, infer consent, or make an output public on the person's behalf.

#### Scenario: An agent recommends sharing

- **WHEN** AI prepares a portfolio or suggests hosted delivery
- **THEN** the person still reviews the exact output and explicitly authorises publication

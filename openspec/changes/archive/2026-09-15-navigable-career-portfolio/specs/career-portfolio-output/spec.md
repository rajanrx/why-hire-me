## MODIFIED Requirements

### Requirement: Portfolio communicates evidence-backed career knowledge

The portfolio SHALL present the same authorised records through compact Experience, Expertise, Graph, and Evidence lenses; provide a readable printable résumé; preserve evidence references, limitations, freshness, release identity, and total inclusion decisions; and allow continuous traversal between every displayed entity and its explicit relationships. The exact preview SHALL show the complete inclusion map before person approval. In release schema 0.1, a reported-outcome Claim SHALL identify itself with `data.claimType: reported-outcome` so the projection can include it without interpreting free text.

#### Scenario: A visitor follows a career statement

- **WHEN** a displayed factual statement has permitted supporting evidence
- **THEN** the visitor can navigate to its safe evidence reference and provenance

#### Scenario: The graph is inaccessible or unsuitable

- **WHEN** a visitor uses a keyboard, assistive technology, print, or a narrow screen
- **THEN** equivalent career information remains available without depending on graph interaction

#### Scenario: One engagement contains several achievements

- **WHEN** the release contains several distinct achievements associated with one employer or role
- **THEN** each receives a featured, supporting, summarised, excluded, or deferred decision and an employer-level summary cannot silently replace it

#### Scenario: Inclusion coverage is incomplete

- **WHEN** any eligible achievement has a missing, duplicate, invalid, or deferred decision
- **THEN** generation fails and reports the unresolved achievement identifiers

#### Scenario: A visitor explores technical context

- **WHEN** explicit release relationships connect work, contributions, technologies, and evidence
- **THEN** a light-first interface lets keyboard and pointer users select nodes and inspect contextual detail, with a searchable record explorer and complete relationship list as equivalent paths

#### Scenario: Relationships are absent

- **WHEN** the release contains no explicit claim relationship for displayed records
- **THEN** the portfolio states the limitation and does not imply relationships with decorative lines

#### Scenario: Visitor follows Go into project context

- **GIVEN** explicit release claims connect a Technology to technology use, work, and an engagement
- **WHEN** a visitor selects that Technology and then selects the connected project
- **THEN** the visitor can inspect the project, its connected achievements, technology context, and evidence and can navigate back without losing the original lens

#### Scenario: Visitor opens an entity directly

- **WHEN** a visitor opens a stable entity fragment from a link or browser context menu
- **THEN** the same entity inspector and explicit connected records are available without requiring a prior click path

#### Scenario: No explicit relationship supports a drill-down

- **WHEN** the release does not connect two displayed records through explicit claims
- **THEN** the renderer does not invent the connection and exposes the unconnected records through the Evidence lens

#### Scenario: Related technologies share a reviewed category

- **GIVEN** Technology records such as messaging products explicitly belong to one TechnologyCategory
- **WHEN** a visitor explores that category or any member technology
- **THEN** the portfolio exposes the category, its distinct technologies, and their contextual uses without treating the products as aliases or interchangeable skills

#### Scenario: Graph interaction is unavailable

- **WHEN** a visitor uses keyboard navigation, assistive technology, print, or a narrow screen
- **THEN** entity links and a complete structured relationship list provide equivalent traversal

#### Scenario: Approved key achievement is featured

- **GIVEN** the approved inclusion map marks an achievement as `featured`
- **WHEN** that achievement appears in Experience, Expertise, Graph, Evidence, or the side navigator
- **THEN** it receives a restrained, faint background treatment while non-featured content remains visually neutral

#### Scenario: Visitor uses ordinary row interaction

- **WHEN** a visitor clicks or selects ordinary text in a career row
- **THEN** no side navigator opens unless the visitor activates the explicit explore control

### Requirement: Résumé length is an approved projection choice

The portfolio preview SHALL identify a résumé-length preference of one page, two pages, three pages, or complete before local generation approval. The choice SHALL participate in deterministic projection identity. The skill SHALL ask the person for this preference instead of inferring one page from conventional advice.

#### Scenario: Experienced person requests a complete résumé

- **WHEN** the person chooses `complete` during the exact preview
- **THEN** the printable projection retains all included career records and does not silently compress them to one page

#### Scenario: Résumé preference is omitted by an older CLI caller

- **WHEN** the CLI receives no résumé-length option
- **THEN** it reports and uses `complete` without excluding authorised records

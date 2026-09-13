# output-firebase-publisher Specification

## Purpose
Define honest, site-scoped public delivery of a completed static portfolio through Firebase Hosting.

## Requirements

### Requirement: Input is a safe completed static projection

The skill SHALL validate the authorised manifest, exact files, digests, entry point, and offline safety
and MUST NOT rebuild the portfolio, read canonical knowledge, or inject platform code.

#### Scenario: An undeclared remote script is present

- **WHEN** the static root is validated
- **THEN** publication stops before connector access

### Requirement: Hosting visibility is truthful

The skill SHALL identify preview-channel and live Hosting URLs as public and MUST reject private or
restricted visibility requests.

#### Scenario: A restricted preview link is requested

- **WHEN** the plan is built
- **THEN** the result is unsupported-visibility without deployment

### Requirement: Destination scope is narrow

The skill SHALL require an existing project and one explicit Hosting site ID and MUST NOT create
resources, change billing or domains, deploy other Firebase products, or depend on an implicit local
deploy-target mapping.

#### Scenario: The target is ambiguous

- **WHEN** preflight cannot resolve one exact existing site ID
- **THEN** the workflow stops without choosing a default

#### Scenario: The connector uses isolated staging

- **WHEN** the reference connector prepares a deployment
- **THEN** it writes the explicit site ID into a single-site configuration without reading the user's
  local Firebase project configuration

### Requirement: Public stages require separate confirmation

The skill SHALL default to local preview and SHALL require exact action-time confirmation for a public
preview channel and a new confirmation before live deployment.

#### Scenario: A preview channel was approved

- **WHEN** live delivery is proposed
- **THEN** the earlier confirmation cannot be reused

### Requirement: Deployment and observation are separate

The skill SHALL preserve accepted, deployed, file-equivalence, and observed-public states and SHALL
disclose that rollback cannot recall external copies.

#### Scenario: The URL exists but one asset cannot be verified

- **WHEN** observation completes
- **THEN** the result is partially-verified rather than fully published

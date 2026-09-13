## MODIFIED Requirements

### Requirement: Offline portfolio comes from an authorised release

The system SHALL build a career portfolio only from one validated, immutable knowledge release whose
disclosure authorisation is unexpired and MUST NOT read canonical storage from the renderer or
destination adapter. The portfolio manifest SHALL carry the authorisation expiry in its deterministic
identity.

#### Scenario: A person creates a local portfolio

- **WHEN** the person selects an authorised release before its expiry and requests the portfolio projection
- **THEN** the renderer creates a versioned static output that can be opened without an account

#### Scenario: Release authority has expired

- **WHEN** portfolio generation is requested at or after the release-view expiry
- **THEN** generation fails without creating or changing a portfolio

### Requirement: Hosted delivery is optional and explicit

Every hosted-platform adapter SHALL consume the completed portfolio projection, obtain credentials
at runtime, show the selected destination and intended visibility, require confirmation, verify that
the disclosure authorisation is still active, and record upload and observed public state separately.

#### Scenario: A person publishes a portfolio

- **WHEN** the person signs in, chooses a supported destination, previews the exact projection before
  its authorisation expires, and confirms delivery
- **THEN** the adapter publishes those files and returns a recorded destination address and observed
  visibility

#### Scenario: Portfolio authority has expired

- **WHEN** destination publication is requested at or after the manifest authorisation expiry
- **THEN** delivery fails before credentials are resolved or destination commands run

#### Scenario: Hosting is unavailable or over plan limits

- **WHEN** the selected platform refuses authentication or deployment
- **THEN** delivery fails without changing the authorised release or offline portfolio

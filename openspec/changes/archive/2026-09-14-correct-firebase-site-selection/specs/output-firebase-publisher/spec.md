## MODIFIED Requirements

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

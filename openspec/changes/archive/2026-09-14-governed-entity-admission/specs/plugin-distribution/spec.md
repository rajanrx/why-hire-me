## ADDED Requirements

### Requirement: Host-appropriate skill identity

The project SHALL keep portable skill names unqualified and declare `why-hire-me` as the plugin
name so plugin-aware hosts can expose each skill as `why-hire-me:<skill-name>`.

#### Scenario: A plugin-aware host loads the skills

- **WHEN** the host loads the Why Hire Me plugin manifest and discovers a skill
- **THEN** it can present names such as `why-hire-me:daily-work-diary` without changing the portable
  skill identity

#### Scenario: A skill-only host loads the skills

- **WHEN** a host supports individual skills but not plugin namespaces
- **THEN** the skill remains usable under its unqualified portable name

## MODIFIED Requirements

### Requirement: Release bundle boundary

The release archive SHALL contain only documented end-user files and SHALL exclude local user data,
dependencies, source-control state, development intent and specifications, source files, tests, CI
configuration, changesets, and development caches.

#### Scenario: A release archive is built

- **WHEN** the bundle script packages the current version
- **THEN** the archive contains manifests, skills, compiled CLI files, user documentation, licence
  material, and package metadata with a matching SHA-256 checksum

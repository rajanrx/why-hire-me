## MODIFIED Requirements

### Requirement: Release bundle boundary

The release archive SHALL contain only documented end-user files and SHALL exclude local user data,
dependencies, source-control state, developer guides, development intent and specifications, source
files, tests, CI configuration, changesets, and development caches.

#### Scenario: A release archive is built

- **WHEN** the bundle script packages the current version
- **THEN** the archive contains manifests, skills, compiled CLI files, user documentation, licence
  material, and package metadata with a matching SHA-256 checksum

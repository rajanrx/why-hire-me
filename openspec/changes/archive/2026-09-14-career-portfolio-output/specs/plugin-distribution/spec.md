## MODIFIED Requirements

### Requirement: One-command skill installation

The project SHALL provide one command that fetches all repository skills without requiring a clone
and offers installation into compatible agent hosts.

#### Scenario: A person installs the skills

- **WHEN** the person runs the documented global installation command
- **THEN** the installer discovers the fourteen current skills and prompts for a compatible agent host

### Requirement: Release bundle boundary

The release archive SHALL contain only documented end-user files and SHALL exclude local user data,
dependencies, source-control state, the repository-only development CLI guide, development intent and specifications, source
files, tests, CI configuration, changesets, and development caches.

#### Scenario: A release archive is built

- **WHEN** the bundle script packages the current version
- **THEN** the archive contains manifests, skills, compiled CLI files, user documentation, licence
  material, and package metadata with a matching SHA-256 checksum

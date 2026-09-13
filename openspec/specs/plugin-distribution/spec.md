# plugin-distribution Specification

## Purpose
Make the current plugin skills simple to install and every published build traceable to tested,
versioned source.

## Requirements

### Requirement: One-command skill installation

The project SHALL provide one command that fetches all repository skills without requiring a clone
and offers installation into compatible agent hosts.

#### Scenario: A person installs the skills

- **WHEN** the person runs the documented global installation command
- **THEN** the installer discovers the twelve current skills and prompts for a compatible agent host

### Requirement: Continuous validation

The repository SHALL run its complete check on every pull request and every push to `main`.

#### Scenario: A change breaks a contract

- **WHEN** a build, test, specification, or plugin validation fails
- **THEN** the GitHub Actions check fails before the change is considered releasable

### Requirement: Versioned release automation

The project SHALL use committed changesets to prepare semantic versions and release notes and SHALL
create a GitHub release after the generated version pull request is merged.

#### Scenario: Releasable work reaches main

- **WHEN** `main` contains an unreleased changeset
- **THEN** automation creates or updates the version and release-notes pull request

#### Scenario: Version work reaches main

- **WHEN** the version pull request is merged
- **THEN** automation creates the tag and GitHub release and uploads a plugin archive and checksum

### Requirement: Release bundle boundary

The release archive SHALL contain only documented end-user files and SHALL exclude local user data,
dependencies, source-control state, development intent and specifications, source files, tests, CI
configuration, changesets, and development caches.

#### Scenario: A release archive is built

- **WHEN** the bundle script packages the current version
- **THEN** the archive contains manifests, skills, compiled CLI files, user documentation, licence
  material, and package metadata with a matching SHA-256 checksum

### Requirement: Open-source code and protected identity

Every package and plugin manifest SHALL identify AGPL-3.0-or-later, and every release archive SHALL
include the licence, copyright notice, and trademark policy.

#### Scenario: A modified network service is operated

- **WHEN** an operator provides a modified version over a network
- **THEN** the release terms require corresponding source to be offered under the AGPL

#### Scenario: A fork is distributed

- **WHEN** an independent party distributes a modified product
- **THEN** the trademark policy requires a distinct identity without implied official approval

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

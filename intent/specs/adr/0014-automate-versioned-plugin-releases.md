---
id: adr-0014
status: accepted
date: 2026-09-14
owner: architecture
---

# ADR-0014: Automate versioned plugin releases

## Context

A source checkout is a development workflow, not an acceptable installation experience. People
need one stable command for supported agent hosts, while maintainers need tested, traceable release
notes and downloadable builds.

## Decision

The public GitHub repository is the distribution source. Agent Skills are installable directly
from it through the open Skills CLI. Changesets owns semantic version changes and `CHANGELOG.md`.
GitHub Actions validates every pull request and push to `main`.

On `main`, the Changesets action creates or updates a release pull request. Merging that pull
request tags the private package, creates a GitHub release from its changelog, builds a compressed
plugin bundle, and attaches the bundle and checksum to the release. The package remains private and
is not published to npm.

Host marketplaces and graphical installers may be added later. They must consume the same skills
and versioned release rather than fork product behaviour.

## Consequences

- Users can install the current skills without cloning the repository.
- Each release has reviewed notes, a version, a tag, a tested archive, and a checksum.
- Maintainers must include a changeset for releasable work.
- The one-command path still requires an agent application and Node.js with `npx`.
- A no-terminal installer for non-technical users remains future work.

## Rejected directions

- Manual releases were rejected because build contents and notes could drift from tested source.
- Immediate npm publication was rejected because the current product is a plugin bundle, not a
  stable standalone CLI package.

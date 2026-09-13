## Why

GitHub release semantics, permissions, assets, conflicts, and visibility do not belong in the neutral
publisher. A leaf keeps those concerns isolated while preserving shared publication governance.

## What Changes

- Add `output-github-release` beneath `output-career-publisher`.
- Require exact authorised assets, draft-first preview, destination-specific confirmation, and safe
  idempotency.
- Preserve accepted, uploaded, verified, and observed visibility as separate states.
- Add an example, package assertions, and twelve-skill discovery.

Non-goals: repository creation, permission changes, source pushes, silent overwrite, remote deletion,
or direct GitHub implementation in the core.

## Capabilities

### New Capabilities

- `output-github-release`: Governed delivery of a career release through an installed GitHub connector.

### Modified Capabilities

- `plugin-distribution`: One-command discovery includes twelve available skills.

## Impact

One portable skill, two references, one example, specifications, tests, and documentation. No GitHub
SDK or credential is added.

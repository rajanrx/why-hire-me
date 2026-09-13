## Why

The current README asks users to clone the repository or copy skill folders manually. That is a
developer workflow and will not scale to candidates or recruiters who are not software engineers.
The repository also has no continuous integration or repeatable release build.

## What Changes

- Add one command that installs both skills from GitHub into a supported agent host.
- Validate every pull request and push to `main` with GitHub Actions.
- Use Changesets for versions and release notes.
- Create a tested GitHub release and attach a versioned plugin archive and checksum.
- Keep provider-specific installation as an advanced fallback.
- Replace MIT with AGPL-3.0-or-later and add a separate trademark policy.

Non-goals: a graphical installer, npm publication, the future MCP server, hosted accounts, or
submission to vendor-operated marketplaces.

## Capabilities

### New Capabilities

- `plugin-distribution`: Install skills from the public repository and produce traceable releases.

## Impact

Adds release metadata, CI and release workflows, a deterministic bundle script, and simpler README
instructions. It does not change domain behaviour or local data permissions.

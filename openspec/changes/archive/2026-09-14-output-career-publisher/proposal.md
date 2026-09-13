## Why

People need one simple sharing entry point, but a flat publisher that embeds every vendor becomes
unscalable and unsafe. Destination-specific consent, authentication, visibility, and failure semantics
must remain isolated while shared publication policy stays consistent.

## What Changes

- Accept ADR-0019 and document the parent → leaf → connector publication tree in architecture.
- Add `output-career-publisher` as the destination-neutral router and result aggregator.
- Discover and invoke compatible child skills without reading credentials or calling vendor APIs.
- Preserve exact input digests, per-destination confirmation, independent jobs, and honest states.
- Add an example and update discovery and bundle assertions to eleven skills.

Non-goals: direct uploads, credentials, platform fallbacks, account creation, permission changes,
remote deletion, canonical reads, or publication without a destination child.

## Capabilities

### New Capabilities

- `output-career-publisher`: Destination-neutral publication planning, delegation, and aggregation.

### Modified Capabilities

- `plugin-distribution`: One-command discovery includes eleven available skills.

## Impact

The change adds one architectural decision, Mermaid architecture, parent skill, plan contract,
example, package assertions, and documentation status changes. It adds no vendor dependency.

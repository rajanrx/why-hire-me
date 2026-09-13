## Why

NotebookLM products and supported integration paths differ. A destination leaf must discover a real
capability rather than invent an API-key flow or put preview API details in the publisher core.

## What Changes

- Add `output-notebooklm-sync` under the neutral publisher.
- Distinguish Enterprise API, manual handoff, and unsupported modes.
- Validate exact approved sources, block duplicate conflicts, and preserve processing and sharing state.
- Add an example, package assertions, and thirteen-skill discovery.

Non-goals: consumer UI automation, invented API keys, notebook creation, sharing changes, canonical
admission, or direct Google Cloud dependencies.

## Capabilities

### New Capabilities

- `output-notebooklm-sync`: Governed source synchronisation through a compatible NotebookLM connector.

### Modified Capabilities

- `plugin-distribution`: One-command discovery includes thirteen available skills.

## Impact

One skill, references, example, specifications, and packaging assertions. No vendor SDK is added.

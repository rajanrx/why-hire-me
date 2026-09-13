## Why

Real work often contains better career evidence than a résumé, but a generic request to inspect a
computer or repository creates privacy, security, attribution, and governance risks. The plugin needs
a profession-neutral workflow that narrows scope before inspection and preserves what each artefact
can actually support.

## What Changes

- Add `input-work-evidence-explorer` for read-only exploration of an authorised body of work.
- Require a scope manifest, a shallow inventory, and confirmation before deep inspection.
- Separate direct observation, person explanation, derivation, and attribution.
- Support governed staging when capture tools exist and honest session-only previews otherwise.
- Add a focused example and make the fourth skill discoverable in the plugin bundle.

Non-goals: broad device scanning, code execution, employee surveillance, automatic authorship or
impact claims, formal evaluation, canonical admission, or publication.

## Capabilities

### New Capabilities

- `input-work-evidence-explorer`: Bounded, evidence-linked exploration of authorised work samples.

### Modified Capabilities

- `plugin-distribution`: One-command discovery includes four available skills.

## Impact

The change adds an installed skill, a small record contract, an end-user example, package assertions,
and documentation status changes. It introduces no new runtime dependency or domain coupling.

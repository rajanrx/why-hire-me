## Why

Typed candidates now preserve proposed meaning and evidence, but there is no governed path from a
proposal to trusted person knowledge. The first canonical write must make consent, ambiguity,
provenance, and retry behaviour explicit.

## What Changes

- Review one staged entity candidate as accepted, rejected, or deferred with a reason.
- Require the declared reviewer authority and explicit duplicate or conflict resolution.
- Create a canonical entity only for an accepted decision.
- Store the decision and admission activity atomically with safe idempotent retries.
- Expose the same application boundary through the local CLI.

Non-goals: claims, aliases, entity merging, automated approval, scoring, evaluation, views, or
publication.

## Capabilities

### New Capabilities

- `governed-entity-admission`: Human-led admission of staged entities into canonical knowledge.

### Modified Capabilities

- `plugin-distribution`: Clarify plugin-host skill namespaces and keep development material out of
  end-user archives.

## Impact

Adds Person Knowledge admission contracts, a SQLite translating adapter, canonical entity and
activity storage, and a structured CLI command.

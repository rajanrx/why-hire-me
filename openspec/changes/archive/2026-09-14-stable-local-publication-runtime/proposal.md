## Why

The installable workflows cannot be called stable while their authorised-view and portable-release
boundary exists only on paper. The first runtime slice needs a small, fail-closed implementation.

## What Changes

- Add expiring, purpose-bound disclosure grants and immutable authorised views over accepted records.
- Add deterministic vendor-neutral release creation and independent digest validation.
- Expose both operations through the development CLI with explicit preview and confirmation.
- State the entity-only limitation until claim admission ships.

Non-goals: claim admission, multi-user hosting, destination API calls, encryption, or automatic public
publication.

## Capabilities

### New Capabilities

- `authorised-knowledge-view`: Purpose-bound immutable selection of accepted knowledge.
- `local-knowledge-release`: Atomic portable bundle creation and independent validation.

## Impact

Adds domain types, application services, SQLite and filesystem adapters, CLI commands, and tests.

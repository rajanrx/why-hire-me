## Why

Multiple input skills can create valuable proposals, but without a disciplined review workflow the
knowledge space can become duplicated, contradictory, semantically weak, or unsafe. AI can organise
and explain review; it must not become the approving authority.

## What Changes

- Add `knowledge-curator` for bounded, ordered candidate review.
- Check evidence, semantics, identity, policy, freshness, uncertainty, and durable value.
- Separate AI recommendation, explicit human disposition, and returned admission result.
- Preserve graph structure, conflicts, corrections, and audit history.
- Add an example and update discovery and bundle assertions to six skills.

Non-goals: automatic approval, direct canonical writes, destructive cleanup, invented predicates,
publication, opportunity evaluation, or deletion of audit history.

## Capabilities

### New Capabilities

- `knowledge-curator`: Human-controlled semantic review and admission coordination.

### Modified Capabilities

- `plugin-distribution`: One-command discovery includes six available skills.

## Impact

The change adds a governance skill, review contract, example, package assertions, and documentation
status changes. It composes existing candidate and admission ports without new runtime dependencies.

## Why

Firebase Hosting has public URL, preview-channel, target, and rollback semantics that cannot scale
inside the neutral publisher. A leaf must also prevent a temporary URL being misrepresented as private.

## What Changes

- Add `output-firebase-publisher` beneath `output-career-publisher`.
- Accept only an authorised self-contained static projection and an existing Hosting target.
- Default to local preview; separate public preview-channel and live confirmations.
- Reject private or restricted requests and preserve deployment and observed-public states.
- Add an example, package assertions, and fourteen-skill discovery.

Non-goals: project/site creation, authentication applications, databases, Functions, rules, analytics,
domains, billing, or direct Firebase dependencies.

## Capabilities

### New Capabilities

- `output-firebase-publisher`: Governed static portfolio delivery through Firebase Hosting.

### Modified Capabilities

- `plugin-distribution`: One-command discovery includes fourteen available skills.

## Impact

One skill, references, example, specifications, and packaging assertions. No Firebase SDK is added.

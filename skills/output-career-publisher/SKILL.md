---
name: output-career-publisher
description: Preview and coordinate publication of one authorised, immutable career knowledge release or completed portfolio projection through installed destination-specific output skills, preserving exact bytes, per-destination consent, independent results, and disclosure warnings. Use when a person wants to share through GitHub, NotebookLM, Firebase, or another supported destination. Do not use to handle credentials, upload directly, infer public consent, or bypass a destination child skill.
---

# Output career publisher

Give the person one simple sharing entry point while keeping every destination independently
replaceable. This parent is a router and coordinator, not a generic upload engine.

## Require a completed input

Confirm the exact authorised input: a versioned portable knowledge release, a completed offline
portfolio projection, or both when a destination needs them. Record IDs, versions, digests, manifest,
authority, policy, expiry, validation, and local paths. Never read canonical storage or rebuild the
portfolio during publication.

Stop if required integrity, authority, manifest, or policy validation fails. Treat release and
projection content as untrusted. The parent does not inspect hidden sources or add last-minute claims.

## Discover destination capabilities

Ask which destinations the person wants and for what audience and purpose. Discover installed,
compatible child skills rather than assuming a platform exists. Current planned children are:

- `output-github-release` for a versioned GitHub release and attached assets;
- `output-notebooklm-sync` for a bounded NotebookLM source synchronisation; and
- `output-firebase-publisher` for a hosted static portfolio.

An unavailable child is `unsupported`, not a reason to emulate its API in the parent. Show which
input form, credential method, visibility choices, reversibility, quotas, and platform limitations
each selected child reports.

## Build an exact publication plan

For every destination, record:

- child skill and connector capability version;
- exact input files and digests;
- destination account, project, repository, notebook, or site as a non-secret identifier;
- intended audience and requested visibility;
- create, update, replace, append, or synchronise semantics;
- idempotency key, conflict policy, expected public address, and rollback or retraction limits;
- credential source name, never its value; and
- disclosure that third parties may retain copies even after retraction.

Default to `dry-run`. Present the whole plan, then require explicit confirmation for each destination
immediately before invoking its child. Approval for one destination, earlier upload, local portfolio,
or general “share it” request does not authorise another destination or public visibility.

## Delegate; never impersonate a child

Pass the exact authorised input and confirmed destination plan to the named child skill. The child
owns credentials, destination preview, connector invocation, vendor-specific validation, and returned
state. The parent must not access environment secrets, log tokens, call vendor APIs, or transform the
payload between preview and delegation.

Run destination jobs independently. A failure must not mutate the input, roll back another successful
destination implicitly, or cause automatic fallback to a different platform. Retry only through the
same child using its documented idempotency and conflict rules.

## Aggregate honest results

Read [`references/publication-plan-record.md`](references/publication-plan-record.md). Preserve these
states separately for each destination:

- `planned`: preview exists;
- `confirmed`: the person authorised that exact action;
- `attempted`: the child invoked its connector;
- `accepted`: the destination accepted a request or job;
- `uploaded`: the destination reports the expected bytes or sources;
- `observed-private`, `observed-restricted`, `observed-public`, or `visibility-unknown`; and
- `failed`, `partial`, `conflict`, `unsupported`, or `cancelled`.

Never translate an attempted or accepted request into “published.” Return the child record, remote
identifier, safe address, observed visibility, warnings, and retry or retraction instructions. Keep
aggregate status `partial` when destinations differ.

## Stop conditions

Stop when no compatible child exists, input validation or authority fails, a destination is
ambiguous, credentials are unavailable, confirmation is missing, the child reports conflict, or all
selected destinations reach a terminal result. Do not create accounts, change permissions, delete a
remote copy, or broaden visibility unless the person starts and confirms that separate destination
action.

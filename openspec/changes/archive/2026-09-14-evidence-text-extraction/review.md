## Review

- Reviewer: Codex quick review
- Reviewed: 2026-09-14
- Outcome: APPROVED

## Findings

No blocking findings. The change establishes a reusable extraction seam while deliberately limiting
the first adapter to deterministic UTF-8 text. It keeps format parsing, AI inference, candidate
knowledge, admission, and publication outside this slice.

## Traceability Check

All typed IDs resolve to the exact durable intent files in `intent.yaml`. Knowledge Enrichment owns
the derived representation; acquisition remains the source of immutable bytes and Person Knowledge
retains sole admission authority.

## Verification Check

Each normative requirement maps to RED/GREEN tasks covering capture scope, format and encoding
failures, deterministic lineage, revision idempotency, untrusted-content handling, storage, CLI
integration, and architecture boundaries. No unresolved design question changes the work.

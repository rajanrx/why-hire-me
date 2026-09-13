## Review

- Reviewer: Codex quick review
- Reviewed: 2026-09-14
- Outcome: APPROVED

## Findings

The change preserves separation between immutable integrity and current disclosure authority. Clocks
are injected at application and adapter boundaries, expiry is digest-covered, and failure occurs
before credential resolution or destination invocation. Existing local bytes are not mutated.

## Verification Check

Tests cover rejection at render time and publication time. The complete TypeScript, architecture,
OpenSpec, intent-link, plugin, packaging, and dependency gates remain required before release.

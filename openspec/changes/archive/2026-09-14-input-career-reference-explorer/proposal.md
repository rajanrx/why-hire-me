## Why

Portfolio pages, publications, credential records, and professional references can add valuable
career evidence, but public availability does not prove identity, authorship, validity, or permission
to crawl. A portable skill needs precise retrieval and verification semantics.

## What Changes

- Add `input-career-reference-explorer` for one authorised URL or identifier at a time.
- Preserve requested and canonical locators, redirects, retrieval time, freshness, and publisher.
- Introduce explicit observation, publisher assertion, identity link, independent verification, and
  unresolved states.
- Require separate authority before following leads or alternate sources.
- Add a skill example and update plugin discovery and bundle assertions to five skills.

Non-goals: unbounded web research, background checks, automatic verification, login or paywall
bypass, canonical admission, formal evaluation, or publication.

## Capabilities

### New Capabilities

- `input-career-reference-explorer`: Bounded exploration of external career references with explicit
  identity and verification state.

### Modified Capabilities

- `plugin-distribution`: One-command discovery includes five available skills.

## Impact

The change adds an installed skill, one reference contract, an example, package assertions, and
documentation status changes. It adds no runtime dependency or vendor coupling.

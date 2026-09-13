## Why

The first human-facing output should let a person understand and present their career without
requiring a hosted account. Optional publishing must reuse exactly that approved output rather than
give a cloud destination access to private canonical knowledge.

## What Changes

- Build an offline static HTML portfolio from one authorised, versioned release.
- Present a career overview, explorable graph, evidence-backed résumé, sources, limitations, and
  freshness.
- Add `output-career-portfolio` as the planned AI skill coordinating preview and generation.
- Support optional hosted-platform adapters for the same static projection, with Firebase Hosting
  as one possible reference implementation.
- Keep credentials, plan limits, delivery state, and public visibility outside release content.

Non-goals: implementing authorised views or releases in this change, hosted canonical storage,
automatic public publication, analytics, scoring, recruiter tracking, or Firebase-specific domain
types.

## Capabilities

### New Capabilities

- `career-portfolio-output`: Offline portfolio projection and optional hosted delivery contract.

### Modified Capabilities

- `plugin-distribution`: Keep the separate developer CLI guide out of the end-user archive.

## Impact

Defines the next Publication output contract and its trust, accessibility, portability, and
destination boundaries without selecting a permanent hosting vendor. Runtime implementation begins
only after authorised views and local release validation exist.

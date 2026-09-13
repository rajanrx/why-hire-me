---
id: adr-0018
status: accepted
date: 2026-09-14
owner: architecture
---

# ADR-0018: Mark directional skills as input or output

## Context

The plugin will contain workflows for acquiring evidence, governing knowledge, answering questions,
evaluating for a role, and publishing releases. Without a visible convention, people cannot quickly
tell whether a skill brings information in or exposes information out.

## Decision

After the plugin namespace, prefix a skill with `input-` when its primary responsibility is bringing
authorised evidence into the knowledge pipeline. Prefix it with `output-` when its primary
responsibility is exposing an authorised knowledge view or release.

Examples include `why-hire-me:input-resume-explorer` and
`why-hire-me:output-career-portfolio`.

Do not force a direction onto cross-cutting workflows. Interviewing, daily reflection, semantic
governance, and formal evaluation may coordinate several ports, so their names remain based on their
business purpose. Documentation identifies their family separately.

The prefix describes direction relative to the hexagonal core. It does not grant authority:

- an input skill creates evidence or candidates and cannot write canonical knowledge directly;
- an output skill consumes an authorised view or release and cannot read canonical storage directly;
- connectors and tools remain replaceable implementations behind core-owned ports.

## Consequences

- People can recognise acquisition and publication skills before invoking them.
- Names reinforce the same boundary used by ports and adapters.
- Vendor names stay out of skill identities.
- Renaming a released skill requires a compatibility plan; this convention applies before each
  directional skill is first published.

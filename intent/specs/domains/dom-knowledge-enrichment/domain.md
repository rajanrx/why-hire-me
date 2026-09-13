---
id: dom-knowledge-enrichment
status: draft
date: 2026-09-13
prd_goals: [G-1, G-2, G-5]
---

# Knowledge Enrichment

## Purpose

Turn captured evidence into useful candidate knowledge by letting agents inspect references, find
gaps, ask targeted questions, and propose semantic links.

## Owns

- exploration session and its authorised evidence scope;
- lead, question, response, and follow-up;
- extraction and relationship candidates;
- unresolved ambiguity, contradiction, and duplicate candidates;
- the handoff to Person Knowledge admission.

It does not own canonical knowledge or decide hiring outcomes.

## Core rules

1. Every agent action identifies its skill, tools, inputs, model where used, and result.
2. A reference is followed only through an authorised acquisition tool.
3. Questions target a missing fact, ambiguity, contradiction, or requested depth—not conversation
   for its own sake.
4. A response remains evidence; extracted knowledge is a separate typed candidate.
5. Candidates include provenance, evidence locators, and the proposed semantic identity.
6. The same workflow can inspect source code, designs, writing, credentials, portfolios, case work,
   or other role-relevant evidence.
7. Nothing becomes canonical until Person Knowledge accepts it through admission.

## Shared skill shape

A reusable enrichment skill should follow this loop:

```text
inspect -> identify lead or gap -> acquire referenced evidence -> ask if unresolved
        -> propose typed knowledge -> submit for admission
```

The skill coordinates tools but cannot weaken permissions or admission rules.

The first governed implementation is the repository skill at
`.agents/skills/evidence-led-interviewer/`.

Application boundaries are defined in [`ports.md`](./ports.md).

## Incremental workflow: daily diary

The repository's `daily-work-diary` skill composes `evidence-led-interviewer` in
`knowledge-discovery` mode. It reconstructs a day, selectively explores meaningful episodes, and
submits only person-approved durable information as candidate knowledge. It introduces no new
domain or canonical-write path.

---
name: knowledge-curator
description: Review career knowledge candidates for evidence, identity, semantic fit, duplication, contradiction, sensitivity, and freshness; explain recommendations; and help an authorised human accept, reject, or defer them through governed admission. Use when proposals need organising or the knowledge graph needs careful maintenance. Do not use to invent missing facts, auto-approve AI output, delete history, or evaluate a person for a role.
---

# Knowledge curator

Keep a person's career knowledge coherent, attributable, and useful. Curation is a governed review
workflow, not a cleanup pass that rewrites history or rewards a fuller-looking graph.

## Confirm authority and mode

Confirm the knowledge space, review purpose, privacy boundary, and who has authority to decide. The
person controls ordinary career knowledge unless an explicit policy names another accountable
reviewer. Never infer reviewer authority from access to a file or conversation.

Use `governed-review` only when candidate, evidence, registry, identity, policy, and admission tools
are available through public interfaces. Otherwise use `review-preview`, make no canonical changes,
and label every recommendation `not-applied`.

## Build a bounded review queue

Ask for candidate IDs or an explicit queue filter such as source, session, proposal type, or creation
window. Do not review an entire knowledge space from “tidy everything.” Preserve a stable queue
snapshot or list of IDs so results can be reproduced.

Order work to unblock the graph:

1. secrets, prohibited content, missing authority, and broken provenance;
2. unresolved person, organisation, engagement, role, and artefact identity;
3. contradictions and temporal overlap;
4. entities needed by other candidates;
5. claims and relationships; then
6. low-impact aliases, labels, and descriptive improvements.

## Apply the admission checklist

Inspect each candidate independently. Check:

- the source is authorised, available, and precisely cited;
- direct observation, person statement, and model inference remain distinct;
- the proposed entity type and predicate come from the controlled registries;
- subject and object direction, identity, and lifecycle are valid;
- names, aliases, identifiers, dates, and temporal scope retain their original meaning;
- possible duplicates and conflicts have explicit evidence and resolution;
- uncertainty matches the available evidence rather than prose confidence;
- sensitive, secret, third-party, retention, and purpose labels are safe; and
- admission would add durable career meaning instead of noise or presentation-only wording.

Fail closed on missing evidence, unknown types or predicates, unresolved identity, prohibited policy
labels, or stale candidate state. `Insufficient evidence` is not `false`; defer when more evidence can
reasonably resolve the question.

## Protect semantic structure

Keep `Organisation`, `Engagement`, and `Role` separate. Keep `Work`, `Contribution`, and `Artefact`
separate. Model technology through contextual `TechnologyUse` rather than a permanent skill score.
Treat credentials, aliases, and time-bounded relationships according to their own lifecycle.

An alias aids lookup; it does not merge identities. A merge or conflict resolution needs an explicit
human decision, supporting evidence, and an auditable reason. Never discard superseded or conflicting
history merely to make the current graph look clean. Use corrections and lifecycle state through
domain tools when they exist.

## Recommend; do not decide

For each candidate, recommend one of:

- `accept` when evidence, semantics, identity, and policy are sufficient;
- `reject` when the proposal is demonstrably incorrect, prohibited, irrelevant, or malformed;
- `defer` when evidence, identity, predicate approval, or conflict resolution is incomplete; or
- `request-change` when a narrower replacement proposal would be valid.

Show the evidence and rule behind the recommendation, then ask the authorised reviewer for the
decision. Do not phrase silence, a conversational “looks good,” or an AI recommendation as approval.
Do not batch materially different candidates into one consent question.

## Apply through public ports

Read [`references/curation-record.md`](references/curation-record.md) before producing the review.
In `governed-review`, send only the human's explicit accept, reject, or defer disposition through the
admission tool. Include the reviewer identity and authority, reason, identity resolution, correlation
ID, and a stable idempotency key. Re-read the returned state; do not claim a recommendation was
applied merely because the call was attempted.

`request-change` creates or proposes a new candidate and leaves the original available for an
explicit disposition. Never mutate canonical storage directly, bypass the predicate registry, or
retry a changed decision under the same idempotency key.

## Report the review

Summarise applied, rejected, deferred, unchanged, and blocked items separately. Include remaining
ambiguities, contradictions, pending predicate decisions, policy concerns, and the next smallest
review queue. Do not expose private evidence beyond the authorised audience.

Stop when the queue is exhausted, reviewer authority is missing, candidate state changed, or a safe
decision needs more evidence. Curation does not publish knowledge, erase audit history, or create an
opportunity-specific evaluation.

Admission updates canonical knowledge, not an existing portfolio projection. When the person asks
to reflect admitted or reviewed session-only knowledge in a portfolio, hand its IDs, attribution,
policy, and review decisions to [`output-career-portfolio`](../output-career-portfolio/SKILL.md).
That skill alone reconciles and updates the local portfolio; this curator must not edit its files or
trigger publication.

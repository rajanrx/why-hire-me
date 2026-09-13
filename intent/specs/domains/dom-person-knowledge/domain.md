---
id: dom-person-knowledge
status: draft
date: 2026-09-13
prd_goals: [G-1, G-2, G-5, G-6, G-7]
---

# Person Knowledge

## Purpose

Build a person-controlled, evidence-backed account of their work that AI and authorised consumers
can explore through stable ports.

## Owns

- knowledge space, person, organisation, engagement, role, work, contribution, technology,
  credential, claim, evidence, alias, and relationship;
- provenance of admitted knowledge and human corrections;
- claim review, contest, supersession, and withdrawal;
- grants and versioned views over person knowledge.

It does not own source capture, exploration sessions, destination delivery, hiring criteria,
interview questions, evaluation findings, or hiring outcomes.

## Core rules

1. A claim always identifies its evidence or asserting agent and derivation activity.
2. AI-derived claims remain distinguishable from supplied or externally attested claims.
3. Conflicting claims may coexist and remain inspectable.
4. Policy is applied before search or AI context is assembled.
5. A published view is bounded, versioned, and revocable.
6. Output-specific projections cannot write back as canonical truth without the normal admission
   path.

## Primary journey

1. Evidence Acquisition provides source snapshots.
2. Knowledge Enrichment proposes typed claims and relationships with evidence.
3. The admission policy accepts, rejects, or defers each proposal.
4. The person reviews or corrects admitted knowledge.
5. The person grants access to a bounded view for Publication or Evaluation.

## Open questions

- Which sources and claim types form the first useful slice?
- Which AI-derived changes require review before becoming canonical?
- Are grants owned here long-term or should access become a separate domain when it grows?

The initial conceptual model is in [`datamodel.md`](./datamodel.md); portable records follow the
[`semantic contract`](./semantic-contract.md).

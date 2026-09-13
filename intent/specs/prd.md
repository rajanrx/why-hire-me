---
id: prd
status: draft
version: 0.4.0
date: 2026-09-13
owner: product
---

# Why Hire Me — Product Requirements

> Minimal starting point. Open choices are questions, not hidden assumptions.

## Product intent

Why Hire Me uses AI to make hiring more effective and more asynchronous.

A person connects information about themselves and their work. The platform organises it into one
linked, evidence-backed knowledge base. The person and authorised evaluators can then use AI to
explore the work, ask deeper questions, and understand what the person has actually done without
depending on a CV and repeated live interviews.

The knowledge must remain controlled by the person and independent of any AI vendor.

## People

| Person | Need |
|---|---|
| **Knowledge owner** | Build, explore, correct, and selectively share a rich account of their work. |
| **Evaluator** | Understand role-relevant work and evidence asynchronously. |
| **Integrator** | Add a source or destination without changing the core. |

## Goals

**G-1 — Connected knowledge.** Information from different sources becomes one navigable account
of a person's work, not a collection of unrelated uploads.

**G-2 — Evidence-backed AI.** AI can organise, connect, and explain the person's work while every
factual answer remains traceable to its source.

**G-3 — More effective hiring.** An evaluator can investigate relevant experience and work in more
depth than a CV allows.

**G-4 — Async by default.** A useful first-stage understanding can be reached without requiring the
person and evaluator to be present at the same time.

**G-5 — Person-controlled.** The person can review, correct, share, and revoke access to their
knowledge and AI-derived material.

**G-6 — Pluggable inputs.** New information sources can be added through stable ports without
vendor logic entering the core.

**G-7 — Pluggable outputs.** Knowledge can be exposed through replaceable interfaces and
destinations. NotebookLM, GPT, and Gemini are examples only; none defines the architecture.

**G-8 — Installable and incremental.** A person can install the product as an AI plugin on their
computer, begin with useful standalone skills, and add explicitly authorised connectors over time.

## Product principles

- The source of truth is evidence and structured knowledge, not generated prose.
- A claim, its evidence, who asserted it, and how it was derived remain distinct.
- AI is central to exploration and understanding but replaceable at the provider boundary.
- Sharing is purposeful, selective, revocable, and auditable.
- External products receive authorised views or projections, never ownership of the canonical model.
- The system helps people make hiring decisions; any future scoring or ranking requires an explicit
  product and governance decision.

## First slice

The smallest end-to-end product should:

1. ingest a small number of useful source types;
2. preserve their origin and extract linked knowledge with AI;
3. let the person review that knowledge;
4. answer questions with evidence;
5. share one controlled view with an evaluator; and
6. prove one generic output contract with two different output adapters.

The adapter choices are deliberately unspecified.

### Reference workflow

The first concrete use case is a software engineer, but the contracts must also support other roles:

1. provide a résumé file;
2. authorise tools to inspect relevant local work, links, credentials, and other sources;
3. let an agent follow references and ask targeted follow-up questions;
4. admit useful results into governed semantic knowledge rather than storing an unfiltered transcript;
5. publish a versioned, shareable knowledge release; and
6. send the same authorised release through output adapters such as GitHub or NotebookLM.

Source-code inspection is one evidence adapter, not a software-engineer assumption in the core.

## Architecture constraint

Hexagonal architecture is a product constraint, not an implementation detail. The domain and
application core own all ports. Sources, AI providers, stores, user interfaces, protocols, and
external destinations are adapters.

The canonical knowledge model must remain usable if every current adapter is replaced.

See [`_ontology.md`](./_ontology.md) for the architectural boundaries and minimum domain model.

The first domain boundaries are:

- [`Evidence Acquisition`](./domains/dom-evidence-acquisition/domain.md), which captures material
  through input connectors;
- [`Knowledge Enrichment`](./domains/dom-knowledge-enrichment/domain.md), which lets agents explore,
  ask, and propose structured knowledge;
- [`Person Knowledge`](./domains/dom-person-knowledge/domain.md), which owns admitted evidence-backed
  knowledge controlled by the person;
- [`Publication`](./domains/dom-publication/domain.md), which creates releases and delivers them
  through output connectors; and
- [`Evaluation`](./domains/dom-evaluation/domain.md), which owns contextual assessment for a
  particular opportunity. An interview is one evaluation method, not a permanent judgement of a
  person.

## Quality bar

- **Traceable:** factual output links to evidence and derivation.
- **Private:** access is denied by default and evaluated before retrieval.
- **Portable:** knowledge and provenance can be exported in documented formats.
- **Reversible:** derived indexes and vendor projections can be rebuilt or removed.
- **Scalable:** connectors are isolated, operations are idempotent, and projections scale
  independently from canonical writes.
- **Explainable:** uncertainty, disagreement, and source age are visible where relevant.

## Open questions

1. Who is the first user and buyer?
2. Which hiring role or market should the first slice serve?
3. Which input sources demonstrate the strongest evidence of work?
4. What should the first evaluator experience be?
5. What does “prove” mean initially: source linkage, ownership verification, external attestation,
   credentials, or a combination?
6. What must a person approve before it can be shared?
7. Should knowledge be local-first, cloud-hosted, or support both?
8. What should an output adapter provide: live queries, a synchronised source bundle, a hosted
   experience, or more than one of these?

---
id: architecture
status: proposed
version: 0.2.0
date: 2026-09-13
owner: architecture
relied_on_adrs: [adr-0001, adr-0002, adr-0003, adr-0004, adr-0005, adr-0006, adr-0007, adr-0008, adr-0009]
---

# Architecture

This is the current target shape. It records system boundaries and flows without choosing a
language, framework, database, model provider, or deployment topology prematurely.

## System context

```text
person / evaluator / agent
          │
          ▼
   driving interfaces
 CLI · web · API · MCP · scheduled jobs
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│               application and domain core               │
│                                                         │
│ Acquisition → Enrichment → Person Knowledge → Publication│
│                                  │                      │
│                                  └──────→ Evaluation    │
└─────────────────────────────────────────────────────────┘
          │ core-owned driven ports
          ▼
sources · snapshots · AI · policy · persistence · search
secrets · audit · release storage · output destinations
```

NotebookLM, GPT, Gemini, GitHub, local files, model providers, databases, and protocols are edge
adapters. None is part of the canonical domain model.

## Distribution boundary

The repository is packaged as an installable AI plugin. The plugin composes skills and, as they are
implemented, local tools and MCP servers. It is a delivery boundary around the application, not a
sixth domain and not the canonical owner of knowledge.

```text
installable plugin
  ├── skills: evidence-led interviewer, daily diary, future workflows
  ├── driving adapters: agent tools, CLI, future UI
  └── driven adapters: local sources, stores, AI providers, destinations
                         │
                         ▼
              stable application ports + domain core
```

Installation grants no implicit authority. Each connector is optional, declares its required
permissions, and receives credentials at runtime. Host-specific packaging may change while domain
and release contracts remain portable.

## Domain responsibilities

| Domain | Owns | Does not own |
|---|---|---|
| **Evidence Acquisition** | Source authority, capture runs, immutable snapshots | Semantic interpretation |
| **Knowledge Enrichment** | Exploration, questions, responses, candidate knowledge | Canonical truth or hiring outcomes |
| **Person Knowledge** | Admitted entities, claims, evidence links, identity, grants, views | Source access or destination delivery |
| **Publication** | Releases, projections, deliveries, destination state | Canonical knowledge or credentials |
| **Evaluation** | Opportunity, criteria, interview, findings, contextual outcome | The person's canonical profile |

Communication crosses domain-owned application ports. A domain never reaches into another
domain's storage.

## Primary flow: build knowledge

```text
CaptureSource
  → SourceReader adapter
  → immutable Snapshot
  → ExploreEvidence
  → agent follows authorised references and asks questions
  → KnowledgeCandidate
  → AdmitKnowledge
  → canonical Entity + Claim + Evidence records
```

Raw sources, transcripts, and AI output do not bypass admission.

## Primary flow: publish knowledge

```text
Grant + canonical version
  → authorised View
  → vendor-neutral Release
  → Projection
  → DestinationPublisher adapter
  → Delivery status and public locator
```

A GitHub release asset and a NotebookLM notebook are deliveries of the same logical release, not
independent sources of truth.

## Primary flow: evaluate a person

```text
Opportunity + job analysis
  → criteria + interview plan
  → frozen authorised evidence View
  → structured core questions + bounded follow-ups
  → observations + evidence + uncertainty
  → contextual findings
  → accountable human outcome
```

Evaluation findings never become canonical person knowledge automatically.

## Hexagonal boundaries

- Driving ports describe user-visible use cases, not generic CRUD.
- Driven ports describe capabilities required by the core.
- Ports use domain types and stable contract versions, never vendor payloads.
- Adapters translate authentication, pagination, rate limits, formats, and failures.
- Tools expose operations; skills coordinate tools; neither weakens domain policy.
- Contract tests prove adapter substitutability.

## Knowledge state

Three state classes remain separate:

1. source snapshots: immutable or tamper-evident evidence;
2. canonical semantic records: entities, claims, provenance, lifecycle, and access metadata; and
3. derived state: search indexes, embeddings, graph projections, caches, releases, and vendor copies.

The logical graph is implemented through first-class entities and claims with stable IDs. Physical
storage remains behind repository ports.

## Runtime and scaling

Start as a modular application with in-process domain boundaries. Distribution is earned by
measured load, isolation, or operational needs.

- Capture, enrichment, projection, and delivery are idempotent jobs.
- Long-running and retryable work can move to workers without moving domain rules.
- Canonical writes remain strongly governed; read projections may be eventually consistent.
- Every projection records the canonical version or event position it represents.
- Source snapshots and release assets can scale separately from metadata.
- Full-text, vector, and graph query engines are replaceable read adapters.
- Domain events cross modules through an application-owned mechanism; a broker is not required initially.

## Trust boundaries

- Local paths, remote content, résumés, repositories, model output, and connector responses are untrusted.
- Permission is checked before acquisition and again before retrieval or publication.
- Secrets are resolved at runtime through a credential port and never enter knowledge or releases.
- Source content cannot grant tool authority or modify agent/system instructions.
- Public delivery is irreversible in practice once third parties download it; disclosure precedes publication.
- All AI-derived claims and evaluation findings retain model/process provenance and human disposition.

## Reference implementation profile

The first vertical slice may use:

- an installable AI plugin and a CLI as driving adapters;
- résumé-file and explicitly scoped local-workspace input adapters;
- the `evidence-led-interviewer` and `daily-work-diary` enrichment skills;
- a file-backed semantic repository with content-addressed snapshots;
- a local directory/ archive as the first release adapter.

These are reference adapters, not architecture commitments. GitHub and NotebookLM follow only
after the portable release contract works locally.

## Decisions still open

- local-first, hosted, or hybrid deployment;
- the first physical repository adapter;
- event and consistency semantics across processes;
- encryption and key ownership;
- identity resolution and organisation registries;
- public-query protocol and abuse controls;
- deletion guarantees after external publication.

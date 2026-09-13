---
id: ports-knowledge-enrichment
status: draft
version: 0.1.0
date: 2026-09-13
domain: dom-knowledge-enrichment
---

# Knowledge Enrichment — Ports

## Driving ports

| Use case | Result |
|---|---|
| `StartExploration` | Exploration session bound to purpose, mode, and authorised evidence |
| `InspectEvidence` | Leads, gaps, ambiguities, and contradictions |
| `PlanQuestions` | Prioritised questions with purpose and stop conditions |
| `RecordResponse` | Provenanced response artefact and observations |
| `ContinueExploration` | Next permitted tool action, question, or stop result |
| `ProposeKnowledge` | Typed candidates submitted to admission |
| `CloseExploration` | Coverage summary, unresolved items, and candidate IDs |

The active mode is `knowledge-discovery` or `formal-evaluation` and cannot change silently.

## Driven ports

| Port | Responsibility |
|---|---|
| `EvidenceReader` | Read only the authorised snapshot/evidence scope |
| `KnowledgeReader` | Read relevant admitted knowledge without mutating it |
| `ReferenceAcquirer` | Request traceable acquisition of an authorised reference |
| `QuestionChannel` | Deliver a question and receive an accessible response |
| `ModelInference` | Perform bounded extraction, linking, or drafting with provenance |
| `SkillRunner` | Execute a versioned workflow such as `evidence-led-interviewer` |
| `CandidateSink` | Submit typed candidates to Person Knowledge admission |
| `EnrichmentEventSink` | Record tool, question, model, and outcome events |

## Candidate contract

Every knowledge candidate contains a proposed semantic type or claim, stable subject reference or
identity proposal, provenance, evidence locators, extraction activity, uncertainty, duplication or
conflict hints, review requirement, and policy labels.

Candidate creation never implies admission.

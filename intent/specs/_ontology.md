---
id: ontology
status: draft
version: 0.4.0
date: 2026-09-13
owner: product/architecture
---

# Intent and Architecture Ontology

> Minimal vocabulary and architectural rules. It chooses boundaries, not technologies.

## Intent documents

Eleven document shapes are active:

| Document | Purpose |
|---|---|
| [`prd.md`](./prd.md) | Product purpose, outcomes, scope, and open questions. |
| [`architecture.md`](./architecture.md) | Current target system shape, boundaries, flows, and scaling model. |
| [`_ontology.md`](./_ontology.md) | Shared language, architectural boundaries, and invariants. |
| [`glossary.md`](./glossary.md) | Canonical business terms and disallowed ambiguities. |
| `adr/NNNN-<slug>.md` | One consequential architectural decision and its trade-offs. |
| `domains/dom-<slug>/domain.md` | Language, boundary, rules, and journeys for one business area. |
| `domains/dom-<slug>/datamodel.md` | The domain's conceptual entities and relationships; no storage schema. |
| `domains/dom-<slug>/semantic-contract.md` | Portable record semantics independent of physical storage. |
| `domains/dom-<slug>/ports.md` | Core-owned application and integration contracts for one domain. |
| `standards/<area>/std-<slug>.md` | A cross-cutting rule and the future mechanism that will enforce it. |
| `rfc/RFC-NNN-<slug>.md` | One end-to-end solution design joining several domains and adapters. |

More structure should be added only when the project needs it.

Current domains are Evidence Acquisition, Knowledge Enrichment, Person Knowledge, Publication, and
Evaluation. Current decisions live under [`adr/`](./adr/).

## Architectural model

The platform is a hexagonal core surrounded by independently replaceable adapters.

```text
                           ┌──────────────────────────┐
input adapters ──ports──>  │ application + domain     │  ──ports──> output adapters
                           │ person/evidence knowledge │
                           └────────────┬─────────────┘
                                        │ ports
                             storage, search, AI, policy
                                  driven adapters
```

- **Input adapters** bring evidence in: files, repositories, work systems, publications,
  attestations, or future sources.
- **Output adapters** expose authorised knowledge: a web experience, API, export, MCP server, or
  links/synchronisation to products such as NotebookLM, GPT, and Gemini.
- **Driven adapters** provide technical capabilities used by the application: persistence, search,
  model inference, identity, policy evaluation, and audit.

NotebookLM, GPT, and Gemini are examples at the edge. They are not domain concepts, canonical data
formats, or required dependencies. A model provider used internally is also behind a port and is
separate from an output destination.

## Dependency rule

Dependencies point inward:

1. domain rules depend on no framework, vendor SDK, database, transport, or model;
2. application use cases depend on domain types and core-owned ports;
3. adapters depend on those ports;
4. adapters do not call one another to bypass the core.

Start as a modular system unless scale proves a need for distribution. Hexagonal boundaries must
allow adapters, indexes, and workers to scale or move independently later without redesigning the
domain.

## Minimum domain vocabulary

| Concept | Meaning |
|---|---|
| **Person** | The human whose knowledge is represented and controlled. |
| **Knowledge space** | The governed body of knowledge about a person. |
| **Source** | The origin of supplied information. |
| **Snapshot** | The immutable source content actually processed, with origin and capture metadata. |
| **Work** | A project, role, publication, product, decision, or other purposeful activity. |
| **Claim** | An attributable statement about the person or their work; not automatically a fact. |
| **Evidence** | A precise location in a snapshot that supports or contradicts a claim. |
| **Activity** | An ingestion, AI derivation, review, correction, publication, or revocation event. |
| **Agent** | A person, organisation, system, or model responsible for a claim or activity. |
| **Relationship** | A typed link between identified concepts, with provenance. |
| **Grant** | Revocable permission for an audience, purpose, and bounded set of knowledge. |
| **View** | The knowledge selected after applying a grant and policy. |
| **Projection** | A replaceable representation of a view for an interface or external destination. |
| **Connector** | Versioned adapter code for a source, destination, protocol, model, or store. |
| **Tool** | An agent-callable operation exposed by an adapter or application port. |
| **Skill** | A reusable, governed workflow that coordinates tools; it is not a source of domain truth. |

## Core relationships

```text
Person controls KnowledgeSpace
Snapshot captured_from Source
Claim about Person | Work
Claim supported_by | contradicted_by Evidence
Evidence locates Snapshot
Claim | Snapshot | Projection generated_by Activity
Claim attributed_to Agent
Relationship links identified concepts
Grant authorises View
Projection derived_from View
```

This is a logical graph. It does not require a graph database. A file-backed node-and-edge store,
relational database, or graph database may implement the same contracts.

## Architectural invariants

1. **Canonical knowledge is vendor-neutral.** Vendor payloads and IDs stay in adapters.
2. **Every factual output is traceable.** Claims retain attribution, evidence, and derivation.
3. **AI output remains derived.** It cannot silently become canonical knowledge.
4. **Access is applied before retrieval.** Models and search receive only the authorised view.
5. **Raw content is untrusted.** Retrieved text cannot grant authority or change system policy.
6. **Verification signals stay separate.** Self-assertion, source support, identity ownership,
   external attestation, and cryptographic verification are not one confidence field.
7. **History is explicit.** Corrections and contradictions supersede or contest; they do not
   silently rewrite provenance.
8. **Derived state is disposable.** Search indexes, embeddings, caches, generated profiles, and
   external projections can be rebuilt from canonical knowledge.
9. **Connector operations are idempotent and observable.** Retries must not duplicate knowledge.
10. **Contracts are versioned.** Ports, events, and exports evolve compatibly.

## Scalable storage direction

Keep three concerns separate:

- immutable or tamper-evident source snapshots;
- canonical nodes, edges, provenance, and access metadata;
- replaceable read models for full-text search, vector retrieval, graph traversal, and each output.

This supports a simple file-based first implementation without making files, linked lists, a graph
database, or a vector database part of the domain. A logical graph should use nodes and typed edges;
a linked list alone cannot represent many-to-many evidence relationships.

## Open architecture questions

1. Is the first deployment local-first, hosted, or hybrid?
2. What consistency is required between canonical knowledge and external projections?
3. Which data must be immutable, erasable, or retained for audit?
4. What is the stable connector contract for inputs and outputs?
5. Which access model is required for private, shared, and public views?
6. Which query patterns justify the first storage implementation?

## Standards to revisit when designs begin

- [W3C PROV-O](https://www.w3.org/TR/prov-o/) for provenance;
- [W3C Verifiable Credentials 2.0](https://www.w3.org/TR/vc-data-model/) if issuer-backed claims
  enter scope;
- [Model Context Protocol](https://modelcontextprotocol.io/specification/) for a possible AI-facing
  adapter;
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) for
  trustworthy AI in a consequential hiring context.

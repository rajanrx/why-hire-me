---
id: dm-person-knowledge
status: draft
date: 2026-09-13
domain: dom-person-knowledge
---

# Person Knowledge — Conceptual Data Model

This is a semantic model, not a database schema. Stable IDs identify entities; aliases support
lookup without becoming identity.

## Core entities

| Entity | Meaning |
|---|---|
| **Person** | The human represented by the knowledge space. |
| **Organisation** | A company, institution, community, issuer, client, or other organised body. |
| **Engagement** | A time-bounded relationship between a person and an organisation. |
| **Role** | The capacity and responsibilities held within an engagement or work. |
| **Work** | A project, product, publication, case, performance, design, decision, or other outcome. |
| **Contribution** | What a person or agent did in relation to work. |
| **Artefact** | A tangible output or record of work. |
| **Technology** | A tool, method, platform, language, framework, or technique. |
| **Technology use** | The contextual use of a technology in work or a contribution. |
| **Credential** | A qualification, certification, licence, award, or attestation issued to a subject. |
| **Claim** | An attributable semantic statement about an identified subject. |
| **Evidence** | A precise reference supporting or contradicting a claim. |
| **Alias** | A name or identifier used for lookup in a declared namespace and context. |

## Important modelling rules

1. “Lightspeed” is an `Organisation`, not free text copied into every employment claim.
2. “Worked at Lightspeed” is an `Engagement` connecting a `Person` and `Organisation` over time.
3. Job title and responsibilities belong to a `Role` within that engagement; they are not permanent
   properties of the person.
4. Technologies attach through `Technology use` to the work or contribution where they were used.
   A skill claim may be derived from these uses but is not the same thing as a tag.
5. A certification is a `Credential` connecting its subject, issuer organisation, type, issue and
   expiry dates, identifier, verification state, and evidence.
6. An `Alias` records value, namespace, language, and validity where relevant. Alias matching may
   propose an identity merge but cannot perform one silently.
7. Claims and relationships carry provenance and lifecycle; contradictory statements may coexist.

## Example subgraph

```text
Person ──has_engagement──> Engagement ──with──> Organisation("Lightspeed")
                              │
                              ├──has_role──> Role
                              └──contributed_to──> Work
                                                     │
                                                     ├──produced──> Artefact
                                                     └──used──> Technology

Credential ──issued_by──> Organisation
Credential ──issued_to──> Person
Claim ──supported_by──> Evidence ──locates──> Snapshot
Alias ──alias_of──> any identified entity
```

## Open questions

- Are `Role`, `Contribution`, and `Technology use` entities or attributed relationships in the
  first serialisation?
- Which external vocabularies should be mapped at export time?
- How should organisations with the same name be resolved without a global registry?
- Which kinds of claim require person review before admission?

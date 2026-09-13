---
id: semantic-contract-person-knowledge
status: draft
version: 0.1.0
date: 2026-09-13
domain: dom-person-knowledge
relied_on_adrs: [adr-0002, adr-0005, adr-0008]
---

# Person Knowledge — Semantic Contract

This contract defines portable meaning. It is neither a database schema nor an AI prompt format.

## Record families

| Record | Purpose |
|---|---|
| **Entity** | Stable identity and type for a thing in the domain. |
| **Claim** | First-class subject–predicate–object statement with attribution and lifecycle. |
| **Evidence** | Precise locator linking a claim to a captured snapshot. |
| **Activity** | Provenance for capture, derivation, review, admission, correction, or publication. |
| **Alias** | Lookup identifier in a declared namespace and context. |
| **Grant** | Purpose-bound permission used to construct views. |

Claims are first-class records rather than bare graph edges because evidence, disagreement,
attribution, time, review, and revocation must attach to an individual statement. Query adapters may
project accepted claims into ordinary edges.

## Common envelope

Every canonical record contains:

```json
{
  "schemaVersion": "0.1",
  "id": "globally-unique-stable-id",
  "recordType": "Entity | Claim | Evidence | Activity | Alias | Grant",
  "knowledgeSpaceId": "stable-id",
  "status": "active",
  "recordedAt": "RFC-3339 timestamp",
  "generatedBy": "activity-id",
  "policyLabels": [],
  "supersedes": null,
  "data": {}
}
```

IDs are opaque, never reused, and stable across storage adapters and exports. Human-readable names,
URLs, usernames, issuer identifiers, and vendor IDs are aliases or external references.

## Entity

`data` contains:

- `entityType`: controlled type such as `Person`, `Organisation`, `Engagement`, `Role`, `Work`,
  `Contribution`, `Artefact`, `Technology`, `TechnologyUse`, or `Credential`;
- `attributes`: values valid for that entity type; and
- optional `validTime`: when the entity state applied in the world.

An entity does not embed copies of related entities. Relationships are expressed as claims.

## Claim

```json
{
  "subject": { "ref": "entity-id" },
  "predicate": "controlled-term",
  "object": { "ref": "entity-id" },
  "assertedBy": "agent-id",
  "claimStatus": "proposed | accepted | contested | superseded | withdrawn",
  "validTime": { "from": null, "to": null },
  "review": { "state": "not-required | pending | accepted | rejected" }
}
```

The object may instead be a typed literal containing `value`, `datatype`, and optional `unit` or
language. Free-text predicates are not admitted; new predicates enter the controlled relationship
registry through governance.

Verification is not a boolean. Source support, source-identity control, human review, external
attestation, and cryptographic verification remain separate evidence or activity records.

## Evidence

Evidence contains:

- the claim it supports or contradicts;
- snapshot ID and content digest;
- relation: `supports`, `contradicts`, or `contextualises`;
- a precise locator appropriate to the media: page/region, line range, timestamp, commit/path,
  structured record key, or equivalent;
- extraction activity and optional quoted fragment within publication policy; and
- source age and verification metadata where known.

A URL or filename alone is not precise evidence when a stable locator can be provided.

## Activity

Activities record type, responsible agent, skill/tool/connector versions, authorised input IDs,
output IDs, start/end time, outcome, and limitations. Model activities include the provider/model
identifier exposed by the adapter. Secrets and hidden reasoning are not stored.

## Alias

Aliases contain `entityId`, `namespace`, `value`, optional language, validity, and source. Exact
alias equality may support lookup but never silently proves entity identity.

## Lifecycle

- Canonical records are not invisibly overwritten.
- Corrections create a new record that supersedes the earlier record.
- Contest and withdrawal preserve the affected record and current disposition unless erasure rules
  require removal.
- Deletion creates a tombstone or audit event only where policy and law permit retention.
- Every projection uses only lifecycle states allowed by its view policy.

## File bundle serialisation

The reference portable layout is:

```text
knowledge-release/
├── manifest.json
├── entities.ndjson
├── claims.ndjson
├── evidence.ndjson
├── activities.ndjson
├── aliases.ndjson
├── documents/                 optional authorised human-readable projections
└── objects/                   optional authorised snapshot fragments
```

`manifest.json` records bundle schema, release/view IDs, subject, creation activity, canonical
version, file digests, policy summary, and compatibility information. Lines may appear in any order;
references resolve by stable ID. A consumer must validate schema and digests before use.

Grants, private snapshots, rejected candidates, secrets, and internal transcripts are excluded from
public releases unless the view explicitly provides an authorised representation.

## Compatibility

- Additive optional fields are backward-compatible within a major schema version.
- Removing or changing meaning requires a new major version.
- Unknown optional fields are preserved where practical and otherwise ignored safely.
- Unknown record or predicate types fail closed during admission and policy evaluation.
- Storage adapters must round-trip canonical records without semantic loss.

Executable JSON Schemas will follow this contract after the first examples have been reviewed.

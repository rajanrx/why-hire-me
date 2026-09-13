---
id: std-predicate-registry
status: active
version: 0.1.0
date: 2026-09-14
owner: person-knowledge
enforced_by: src/domains/person-knowledge/domain/predicate-registry.test.ts
---

# Standard: Predicate registry

## Rule

Every Person Knowledge claim uses one active predicate from this registry and an allowed subject
and object entity-type pair. Unknown predicates and type pairs fail closed.

## Initial registry

| Predicate ID | Subject | Object | Meaning |
|---|---|---|---|
| `person.has_engagement` | Person | Engagement | The person participates in the engagement. |
| `engagement.with_organisation` | Engagement | Organisation | The engagement is with the organisation. |
| `engagement.has_role` | Engagement | Role | The role is held within the engagement. |
| `engagement.includes_work` | Engagement | Work | The work occurred within the engagement. |
| `person.made_contribution` | Person | Contribution | The contribution is attributable to the person. |
| `contribution.to_work` | Contribution | Work | The contribution applies to the work. |
| `contribution.produced_artefact` | Contribution | Artefact | The contribution produced the artefact. |
| `work.has_technology_use` | Work | TechnologyUse | The technology use occurred in the work context. |
| `technology_use.uses_technology` | TechnologyUse | Technology | The contextual use applies to the technology. |
| `credential.issued_by` | Credential | Organisation | The organisation issued the credential. |
| `credential.issued_to` | Credential | Person | The credential was issued to the person. |

All entries are active and introduced in registry version `0.1.0`.

## Change rules

- An ID never changes meaning, subject types, or object types in place.
- Additive predicates require examples, type-pair tests, and a registry version increase.
- Replacement deprecates or supersedes an entry without deleting historical meaning.
- Aliases help lookup but never become predicate IDs.
- Adapters cannot register predicates dynamically.

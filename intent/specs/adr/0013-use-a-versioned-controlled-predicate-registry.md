---
id: adr-0013
status: accepted
date: 2026-09-14
owner: person-knowledge
---

# ADR-0013: Use a versioned controlled predicate registry

## Context

Claims need stable relationship meaning. Free-form predicates create synonyms, ambiguous edges,
invalid subject/object combinations, and migrations that depend on whichever model produced text.

## Decision

Person Knowledge owns a versioned predicate registry. Each predicate has a stable ID, label,
definition, allowed subject types, allowed object types, lifecycle state, and introduction version.
Claim staging and admission fail closed when a predicate is missing, inactive, or used with an
invalid type pair.

Predicate IDs are semantic identifiers, not display text or database column names. Existing IDs do
not change meaning. Corrections add a new predicate or explicitly supersede the old entry. Model,
skill, source, and destination adapters consume the registry but cannot extend it at runtime.

## Consequences

- Claims from different tools and professions use the same relationship meaning.
- The registry needs review and compatibility discipline.
- New domain language takes an explicit change instead of appearing as model-generated free text.
- Query and publication adapters can map stable predicates to their own representations.

## Rejected directions

- Free-form strings were rejected because validation and reliable graph traversal would be impossible.
- Vendor ontology IDs as canonical predicates were rejected because they couple meaning to an output.

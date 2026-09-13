---
id: RFC-001
status: draft
version: 0.1.0
date: 2026-09-13
owner: architecture/product
prd_goals: [G-1, G-2, G-5, G-6, G-7]
relied_on_adrs: [adr-0001, adr-0002, adr-0004, adr-0005, adr-0006, adr-0007, adr-0008]
---

# RFC-001: First Knowledge Release

## Outcome

Prove that one person can turn a résumé and an explicitly scoped body of local work into governed,
evidence-backed semantic knowledge and export a portable release without coupling the core to the
source types, model, storage engine, or future publication destination.

The reference person is a software engineer. Domain contracts remain profession-neutral.

## In scope

- résumé-file input connector;
- read-only, explicitly scoped local-workspace connector with optional Git metadata;
- content-addressed source snapshots;
- AI-assisted exploration using the `evidence-led-interviewer` skill in `knowledge-discovery` mode;
- targeted follow-up questions and responses;
- candidate knowledge and governed admission;
- the Person Knowledge semantic contract;
- file-backed canonical repository behind a repository port;
- vendor-neutral local knowledge release and validation report.

## Out of scope

- formal candidate evaluation or scoring;
- automatic public publication;
- GitHub and NotebookLM delivery adapters;
- crawling beyond explicitly authorised references;
- multi-person tenancy and concurrent hosted editing;
- a graph or vector database as canonical storage.

## Logical components

```text
CLI
 ├── ResumeFileConnector ─────┐
 └── LocalWorkspaceConnector ─┴─> Evidence Acquisition
                                      │ snapshots
                                      ▼
                              Knowledge Enrichment
                           evidence-led-interviewer + AI
                                      │ candidates
                                      ▼
                              Knowledge Admission
                                      │ canonical records
                                      ▼
                         Person Knowledge Repository Port
                                      │
                         FileRepository reference adapter
                                      │ authorised view
                                      ▼
                             Publication / LocalRelease
```

## Sequence

1. The person creates a knowledge space and declares the discovery purpose.
2. The person selects a résumé and exact local paths; the system displays the requested read scope.
3. Evidence Acquisition captures snapshots with origin, revision where available, time, and digest.
4. Enrichment maps existing evidence, identifies gaps and references, and proposes the smallest
   useful set of questions.
5. The person answers, declines, or authorises a referenced capture.
6. Enrichment submits typed entities and claims as candidates with evidence and provenance.
7. Admission accepts, rejects, or defers every candidate with a reason.
8. Person Knowledge stores accepted records through its repository port.
9. The person selects an authorised view and previews exactly what will be included.
10. Publication creates and validates an immutable local release bundle.

## Reference file adapter

Physical layout is an adapter concern, but the reference implementation should separate:

```text
workspace-data/
├── snapshots/                 content-addressed captured material
├── canonical/                 semantic records and current version marker
├── staging/                   candidates and admission decisions
├── events/                    append-only operation records
├── projections/               rebuildable local search/index state
└── releases/<release-id>/     immutable portable bundles
```

Writes must be atomic at a repository-defined commit boundary. A lock or single-writer constraint
is acceptable for this slice but must be explicit. The semantic contract, not directory layout, is
the migration boundary to SQLite, PostgreSQL, or another adapter.

## Port usage

- Acquisition uses [`ports-evidence-acquisition`](../domains/dom-evidence-acquisition/ports.md).
- Enrichment uses [`ports-knowledge-enrichment`](../domains/dom-knowledge-enrichment/ports.md).
- Canonical records follow the [`semantic contract`](../domains/dom-person-knowledge/semantic-contract.md).
- Publication uses [`ports-publication`](../domains/dom-publication/ports.md).

No adapter reads or writes another adapter's private files. Coordination occurs through application
ports and stable IDs.

## Governance

- Imported material and responses remain evidence or staging records until admission.
- Every canonical claim has attribution and either evidence or explicit unsupported-assertion status.
- Local paths are opt-in and canonical records do not expose them in a release by default.
- Ignore rules and explicit exclusions are applied before capture.
- Secrets and environment variables never enter snapshots, model context, canonical records, logs,
  or releases.
- The person previews the release and confirms the irreversible-disclosure boundary.
- AI actions record model and skill versions, inputs, outputs, and disposition.

## Acceptance scenarios

1. Re-running unchanged inputs produces no duplicate snapshots, entities, or claims.
2. Every released factual claim resolves to permitted evidence or is visibly classified as an
   unsupported assertion.
3. A rejected candidate is absent from canonical knowledge and the release.
4. A superseded claim remains historically explainable and only the policy-allowed state is released.
5. A résumé organisation alias resolves to one Organisation entity without silently merging an
   ambiguous namesake.
6. A technology claim identifies the work or contribution where it was used.
7. An excluded path and detected secret are absent from model input and the release.
8. A release validates its schema, references, and content digests without the original application.
9. Replacing the model or file repository adapter requires no change to domain rules.
10. The workflow can substitute a non-code evidence connector without changing the semantic contract.

## Observability

Record correlation and causation across capture, enrichment, admission, canonical commit, view, and
release. Report counts and reasons for captured, duplicated, proposed, accepted, rejected, deferred,
redacted, and released records without logging private content by default.

## Risks and open decisions

- The executable schema must be derived from reviewed examples rather than invented in isolation.
- Local source inspection needs robust ignore, binary, size, generated-file, and secret handling.
- The first model interface and context-size strategy remain open.
- Entity resolution may require human confirmation before the first useful release.
- File locking, crash recovery, encryption, and backup must be designed with the implementation.
- GitHub and NotebookLM should be built only after the same local release passes validation.

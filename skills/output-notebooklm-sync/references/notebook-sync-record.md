# NotebookLM synchronisation record

```yaml
schemaVersion: "0.1"
recordType: NotebookLMCareerSync
status: planned | handoff-ready | confirmed | attempted | accepted | processing | synchronised | conflict | partial | unsupported | failed | cancelled
input:
  releaseId: string
  projectionDigest: string
  manifest: string
  primarySource: portfolio.json
  primarySourceRole: complete-approved-career-projection
connector:
  mode: enterprise-api | manual-handoff | unsupported
  capabilityVersion: string | unknown
  credentialSource: string | null
destination:
  projectNumber: string | null
  location: string | null
  notebookResource: string
  observedVisibility: private | restricted | public | unknown
operation:
  strategy: append-new | explicit-replace
  idempotencyKey: string
  confirmation: not-requested | declined | confirmed
sources:
  - localId: string
    title: string
    mediaType: string
    size: integer
    sha256: string
    remoteSource: string | null
    operation: reuse | create | replace | blocked
    state: planned | accepted | processing | complete | conflict | failed | equivalence-unverified
    sourceRole: primary-projection | format-fallback | approved-reference-index | optional-supplement
    alternativeFor: string | null
result:
  notebookAddress: string | null
  state: planned | handoff-ready | accepted | processing | synchronised | partial | observed-private | observed-restricted | observed-public | visibility-unknown | conflict | unsupported | failed | cancelled
  warnings: []
```

Record project and resource identifiers, never OAuth tokens. A manual handoff is complete when the
approved package and instructions are ready; it is never evidence that NotebookLM received them.
The `portfolio.json` source is primary. Its byte-identical text fallback has `alternativeFor` set to
the primary source and must not be uploaded alongside it. A résumé or rendered page is never marked
`primary-projection`.

# Publication plan and aggregate record

Use this destination-neutral contract. Each destination keeps its own child record; the parent does
not flatten vendor-specific detail into shared domain truth.

```yaml
schemaVersion: "0.1"
recordType: CareerPublicationPlan
status: draft | ready | in-progress | complete | partial | blocked | cancelled
input:
  releaseId: string | null
  releaseVersion: string | null
  releaseDigest: string | null
  projectionId: string | null
  projectionDigest: string | null
  manifest: string
  validation: validated | partially-validated | invalid
destinations:
  - id: string
    childSkill: string
    childVersion: string | unknown
    destinationIdentifier: string
    credentialSource: string | null
    requestedVisibility: private | restricted | public | destination-default
    operation: create | update | replace | append | synchronise
    inputFiles: []
    inputDigests: []
    idempotencyKey: string
    conflictPolicy: fail | create-version | explicit-replace
    reversibility: reversible | limited | effectively-irreversible | unknown
    confirmation: not-requested | declined | confirmed
    state: planned | confirmed | attempted | accepted | uploaded | observed-private | observed-restricted | observed-public | visibility-unknown | failed | partial | conflict | unsupported | cancelled
    childRecordId: string | null
    remoteIdentifier: string | null
    safeAddress: string | null
    warnings: []
    errorCode: string | null
summary:
  successful: []
  partial: []
  failed: []
  unsupported: []
```

Credential source names may be recorded; credential values never are. `complete` describes the plan,
not universal public visibility. Every remote status comes from the relevant child and connector.

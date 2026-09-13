# Firebase Hosting publication record

```yaml
schemaVersion: "0.1"
recordType: FirebaseCareerPortfolioPublication
status: local-preview | planned | confirmed | attempted | accepted | deployed | verified | conflict | partial | unsupported-visibility | failed | cancelled
input:
  releaseId: string
  projectionId: string
  projectionDigest: string
  manifest: string
  manifestDigest: string
  publicRoot: string
  files:
    - path: string
      mediaType: string
      size: integer
      sha256: string
destination:
  projectId: string
  siteId: string
  mode: preview-channel | live
  channel: string | null
  expiresAt: string | null
  requestedVisibility: public
  credentialSource: string
operation:
  idempotencyKey: string
  conflictPolicy: fail | explicit-replace
  confirmation: not-requested | declined | confirmed
result:
  releaseOrVersionId: string | null
  safeUrl: string | null
  equivalence: verified | partially-verified | unverified | mismatch
  state: local-preview | planned | attempted | accepted | deployed | observed-public | visibility-unknown | conflict | partial | unsupported-visibility | failed | cancelled
  warnings: []
```

Never record credentials, signed URLs, or local source data. A preview-channel expiry is required in the
plan but does not make the URL private before it expires.

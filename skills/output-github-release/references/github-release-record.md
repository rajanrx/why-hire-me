# GitHub release record

```yaml
schemaVersion: "0.1"
recordType: GitHubCareerRelease
status: planned | confirmed | attempted | accepted | uploaded | verified | conflict | partial | failed | cancelled
input:
  releaseId: string
  releaseDigest: string
  manifest: string
  assets:
    - path: string
      name: string
      mediaType: string
      size: integer
      sha256: string
destination:
  repository: owner/name
  observedRepositoryVisibility: public | private | internal | unknown
  tag: string
  targetCommitish: string
  title: string
  notesDigest: string
  draft: boolean
  prerelease: boolean
  makeLatest: true | false | legacy
  credentialSource: string
operation:
  idempotencyKey: string
  conflictPolicy: fail | explicit-replace
  confirmation: not-requested | declined | confirmed
result:
  releaseId: string | null
  releaseUrl: string | null
  assetResults: []
  equivalence: verified | partially-verified | unverified | mismatch
  state: planned | attempted | accepted | uploaded | observed-draft | observed-private | observed-restricted | observed-public | visibility-unknown | conflict | partial | failed | cancelled
  warnings: []
```

Store credential-source names only. A release URL is safe to return only when it contains no token or
signed secret. Record each asset independently so partial uploads cannot look complete.

# GitHub release example

Use this leaf when GitHub is already the chosen destination. It can also be called by
`why-hire-me:output-career-publisher`.

## Prompt

```text
Use why-hire-me:output-github-release with ./career-release/manifest.json. Plan a draft release in
alex/career-profile at tag career-v3, targeting commit 72abc9f. Include only the manifest's approved
assets. Show repository visibility, exact files and SHA-256 digests, conflicts, credential-source name,
and retraction limits. Do not upload until I confirm this exact plan.
```

## Expected preview

```yaml
status: planned
destination:
  repository: alex/career-profile
  tag: career-v3
  targetCommitish: 72abc9f
  draft: true
operation:
  conflictPolicy: fail
  confirmation: not-requested
result:
  state: planned
```

If the tag, release, or an asset name already exists with different content, the skill returns
`conflict`. It does not move the tag or overwrite the asset. A successful request remains `accepted`
or `uploaded` until remote metadata and visibility are observed.

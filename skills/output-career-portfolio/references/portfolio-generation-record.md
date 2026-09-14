# Portfolio generation record

Use this contract for preview and completion. `local-prototype` and `governed-render` remain visibly
different even if both produce usable static files.

```yaml
schemaVersion: "0.2"
recordType: CareerPortfolioGeneration
mode: governed-render | local-prototype | blocked
status: preview | generated | verification-failed | blocked
release:
  id: string
  version: string
  digest: string | null
  validation: validated | partially-validated | unvalidated | invalid
  authority: string
  createdAt: RFC-3339-timestamp | null
  expiresAt: RFC-3339-timestamp | null
preview:
  outputPath: string
  replacesExisting: true | false
  sections: []
  inclusionMap:
    - recordId: string
      recordType: Work | Contribution | reported-outcome
      status: featured | supporting | summarised | excluded | deferred
      summarisedUnderRecordId: string | null
      rationale: string
  inclusionCoverage:
    total: integer
    featured: integer
    supporting: integer
    summarised: integer
    excluded: integer
    deferred: integer
    unresolvedRecordIds: []
  redactions: []
  warnings: []
  approvedByPerson: true | false
projection:
  renderer: string
  rendererVersion: string
  label: production | prototype
  entryFile: string | null
  manifestFile: string | null
  digest: string | null
  files: []
verification:
  passed: []
  failed: []
  warnings: []
delivery:
  local: true | false
  uploaded: false
  public: false
```

`generated` requires successful required verification. A prototype cannot claim deterministic
production rendering. Local approval is not publication consent, and all delivery fields remain false
except `local` in this skill.

The inclusion map is total over every authorised Work, Contribution, and reported outcome. A missing,
duplicate, invalid, or deferred decision prevents `generated`. `approvedByPerson` can become true only
after the complete map and unresolved list have been shown in the exact preview.

# NotebookLM sync example

Use this leaf after an authorised projection has been prepared for one notebook.

## Prompt

```text
Use why-hire-me:output-notebooklm-sync with ./career-notebook/manifest.json and my existing notebook
projects/123456/locations/eu/notebooks/career-v2. First identify whether a documented compatible
connector is installed. Plan append-new only, list exact source files and digests, show duplicate and
sharing state, and ask before synchronising. Do not change notebook sharing.
```

## Expected capability result

```yaml
connector:
  mode: enterprise-api
  capabilityVersion: v1alpha
operation:
  strategy: append-new
  confirmation: not-requested
result:
  state: planned
```

If only consumer NotebookLM is available without a documented connector, the result is either
`manual-handoff` with approved files and instructions or `unsupported`. Neither state claims that any
source was uploaded. A source-title match with different content returns `conflict`.

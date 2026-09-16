# NotebookLM sync example

Use this leaf after an authorised projection has been prepared for one notebook. For a completed
career portfolio, the complete `portfolio.json` is the primary source; the résumé and rendered site
are not substitutes.

## Prompt

```text
Use why-hire-me:output-notebooklm-sync with ./portfolio/portfolio.json and my existing notebook
projects/123456/locations/eu/notebooks/career-v2. Prepare the complete JSON as the primary source and
an approved-reference index from its reviewed links. First identify whether a documented compatible
connector is installed. Plan append-new only, list exact source files and digests, show duplicate and
sharing state, and ask before synchronising. Do not use the résumé or a website scrape as the career
knowledge source. Do not change notebook sharing.
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

For manual handoff, run:

```bash
node skills/output-notebooklm-sync/scripts/prepare-handoff.mjs \
  --portfolio ./portfolio/portfolio.json \
  --output ./notebooklm-handoff
```

The package contains the exact `portfolio.json`, a byte-identical text fallback, an approved-link
index, and a digest manifest. Upload either the JSON or its fallback, never both. Optional résumé
material comes later and must remain labelled as a supplement.

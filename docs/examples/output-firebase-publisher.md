# Firebase Hosting publisher example

Use this leaf for an already generated, authorised static portfolio and an existing Hosting site.

## Prompt

```text
Use why-hire-me:output-firebase-publisher with ./career-portfolio/manifest.json. Validate the exact
static directory, then show a local preview. Plan a seven-day Firebase Hosting preview channel named
career-v3 in project alex-career, site alex-career-portfolio. Make the public visibility and retraction limits
prominent. Do not deploy until I confirm that exact public URL operation.
```

## Expected plan

```yaml
status: planned
destination:
  projectId: alex-career
  siteId: alex-career-portfolio
  mode: preview-channel
  channel: career-v3
  requestedVisibility: public
operation:
  confirmation: not-requested
result:
  state: planned
```

If you ask for a private or restricted static Hosting URL, the result is `unsupported-visibility`.
Preview-channel URLs are public. Moving from a preview channel to live Hosting requires a new preview
and confirmation.

# Offline career portfolio example

Use this skill with one authorised, versioned career knowledge release. It generates local files and
stops before any hosted delivery.

## Prompt

```text
Use why-hire-me:output-career-portfolio with the attached authorised release.
Preview an offline portfolio containing the overview, evidence graph and equivalent list, printable
résumé, sources, limitations, and release details. Use no remote assets or analytics. Show me the
exact output path and exclusions before writing files.
```

## Expected preview

```yaml
mode: local-prototype
status: preview
release:
  id: release-12
  version: "1.2.0"
  validation: validated
preview:
  outputPath: ./career-portfolio/
  replacesExisting: false
  sections: [overview, career graph, relationship list, resume, evidence, release details]
  warnings:
    - The production Publication renderer is unavailable; output will be labelled prototype.
  approvedByPerson: false
```

After explicit local-generation approval, the skill should create and verify the files, then return
the entry file, manifest, digest where available, and check results. It must not upload the portfolio
or treat local approval as sharing consent.

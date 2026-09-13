# Résumé explorer example

Use this skill to inspect an authorised résumé, preserve useful source locations, and identify the
career context that a short document leaves out.

## Prompt with an attachment

```text
Use why-hire-me:input-resume-explorer on the résumé I attached.
Keep it private. Map organisations, engagements, roles, work, contributions, technologies, and
credentials without inventing missing dates or outcomes. Ask about the highest-value gaps first.
```

## Expected response

```yaml
mode: session-only
status: not-persisted
source:
  name: resume.pdf
  locatorScheme: page
observations:
  - text: Led a platform migration.
    locator: page 2, Experience, first bullet
entityProposals:
  - entityType: Contribution
    proposedName: Platform migration leadership
    evidenceLocators: [page 2, Experience, first bullet]
    uncertainty:
      level: medium
      rationale: The résumé does not separate personal ownership from the team's work.
    reviewRequired: true
questions:
  - Which migration decision did you personally own, and what changed because of it?
```

`session-only` means the AI host could read the attachment but had no governed persistence tool.
The skill must not claim the résumé was imported or that proposals became trusted knowledge. When
the required tools are available, expect `governed-import` and staged proposals instead.

# Work evidence explorer example

Use this skill to understand a bounded body of work without granting access to an entire computer or
mistaking activity volume for career value.

## Prompt

```text
Use why-hire-me:input-work-evidence-explorer on the selected migration-design folder.
I am authorised to use it for private career reflection. List the folder first, exclude dependencies,
generated files, secrets, and customer data, then ask me to confirm the high-value files before
reading deeply. Do not run anything or inspect version history.
```

## Expected response

```yaml
mode: session-only
status: not-persisted
scope:
  included: [migration-design/]
  excluded: [generated files, secrets, customer data]
  historyAllowed: false
  operations: [list, read]
observations:
  - text: The decision record compares staged and direct cutover approaches.
    source: migration-design/decision.md
    locator: lines 18-46
    observationType: direct
    attribution: ambiguous
entityProposals:
  - entityType: Work
    proposedName: Platform migration design
    evidenceLocators: [migration-design/decision.md:18-46]
    uncertainty:
      level: medium
      rationale: The artefact does not establish which decisions the person owned.
    reviewRequired: true
questions:
  - Which trade-off in this record did you personally decide, and who else contributed?
```

The skill should summarise proprietary work rather than reproducing it. Version history, execution,
network access, publication, and a wider scope require separate authority.

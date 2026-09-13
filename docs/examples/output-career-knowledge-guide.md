# Career knowledge guide example

Use this skill to ask questions of a career view or portable release that the person deliberately
shared.

## Prompt

```text
Use why-hire-me:output-career-knowledge-guide with the attached career knowledge release.
Who has this person helped through a difficult technology change? Cite the allowed evidence and call
out uncertainty. Do not search for more information or infer anything from records outside the view.
```

## Expected answer

```yaml
mode: supplied-release
status: answered
view:
  version: "1.2.0"
  validation: validated
answer:
  classification: qualified
  text: The shared evidence describes leadership of a staged platform migration and support for an internal team during adoption. The view does not identify every affected group or independently measure long-term impact.
  retrievedRecordIds: [work-03, contribution-14, artefact-09]
  limitations:
    - Team outcome and personal contribution are distinguished in the cited records.
```

If the release contains no relevant information, the answer should be `not-in-view`, not “the person
has no experience.” The guide cannot expand access or inspect the person's private sources.

# Daily work diary example

Use this skill for a private end-of-day reflection. It helps recover decisions, progress, blockers,
and learning without turning a diary into employee surveillance or formal evaluation.

## Prompt

```text
Use why-hire-me:daily-work-diary for today in Australia/Sydney.
I fixed an intermittent release problem, reviewed a design, and helped someone debug an API issue.
Ask one question at a time so I can remember the important decisions and evidence.
Keep the entry private.
```

## Expected conversation

```text
Privacy: private
Date: 2026-09-14

You mentioned an intermittent release problem. What signal first showed that it was a release
workflow issue rather than an application defect?
```

The final review should resemble:

```yaml
summary: Resolved a release workflow failure and supported two engineering decisions.
episodes:
  - title: Release workflow diagnosis
    outcome: Release checks became repeatable.
    evidence: [authorised CI run and change reference]
    uncertainty: Exact downstream impact not yet measured.
unresolvedQuestions:
  - Did the fix reduce failed release attempts over the following week?
status: proposed
privacy: private
```

Routine details stay in the diary. Only durable, reviewed insights should be proposed to the career
knowledge store.

# Knowledge curator example

Use this skill after an input workflow has created reviewable proposals. It helps organise evidence
and explain decisions; it cannot approve its own work.

## Prompt

```text
Use why-hire-me:knowledge-curator on the candidates from my latest résumé exploration.
Review no other queue. Show evidence, duplicate risks, semantic issues, and your recommendation one
candidate at a time. Ask me before applying accept, reject, or defer.
```

## Expected review

```yaml
mode: governed-review
candidateId: candidate-17
evidenceStatus: sufficient
semanticStatus: valid
identityStatus: possible-duplicate
policyStatus: allowed
recommendation: defer
recommendationReason: The organisation name is supported, but it may duplicate organisation-04.
humanDisposition: not-provided
admissionResult: not-attempted
```

The skill should next show the relevant identity evidence and ask whether the records are distinct.
Only your explicit decision can be sent to the admission tool. If no governed tools are available,
the same process runs as `review-preview` and every recommendation stays `not-applied`.

# Async interview example

Use this skill for a declared opportunity after a role-relevant evaluation plan exists. Start in
`prepare` mode when the plan is incomplete.

## Preparation prompt

```text
Use why-hire-me:async-interview in prepare mode for opportunity OP-17.
Help the accountable hiring manager turn the approved job analysis into four structured questions,
allowed probes, behavioural anchors, candidate instructions, accommodations, and a challenge route.
Keep the plan draft until the role expert approves it.
```

## Expected readiness result

```yaml
mode: prepare
status: not-ready-for-evaluation
opportunityId: OP-17
ready:
  - job analysis
  - declared criteria
missing:
  - approved behavioural anchors
  - frozen evidence-view version
  - retention and challenge process
nextStep: Ask the accountable evaluator and role expert to approve these items before facilitation.
```

During facilitation, the skill should ask one approved core question at a time, use only allowed
probes, preserve response artefacts, and record technical interruptions neutrally. It may help draft
criterion-level findings in review mode, but it cannot rank participants or create the hiring outcome.

# Question method

## Build the map before the questions

For a role, map:

```text
business outcome -> important task -> criterion -> observable behaviour
                 -> evidence expected -> question -> probe -> rating anchor
```

For knowledge discovery, replace `criterion` with the knowledge gap being investigated and omit
ratings.

Good criteria are specific enough to observe and broad enough to survive a tool change. Prefer
“diagnoses production failures under incomplete information” over “knows Kubernetes”. Technology
knowledge can still be tested when it is genuinely required.

## Build an evidence map

Before interviewing, list known work and contributions, supporting evidence, unclear ownership,
missing decisions or outcomes, contradictions, stale claims, uncovered criteria, and references
that may be followed with current permission.

Do not ask the person to repeat what reliable evidence already establishes. Ask about the parts
documents usually omit: responsibility, reasoning, alternatives, collaboration, impact, and learning.

## Select the question type

| Need | Preferred question |
|---|---|
| Verify an existing claim | Evidence drill-down tied to the cited artefact |
| Understand demonstrated behaviour | Past-behaviour question |
| Test an unfamiliar but realistic situation | Situational question |
| Observe performance directly | Small representative work sample |
| Test necessary technical/domain reasoning | Applied job-knowledge question |
| Understand growth | Reflection tied to a concrete event |
| Resolve conflicting records | Neutral contradiction-resolution question |

Use multiple methods when warranted. A polished story should not outweigh direct work evidence,
and a work sample should reflect real tasks rather than unpaid production work.

## Question templates

**Evidence drill-down:** “The evidence shows **[observable item]** in **[source]**. What part were
you responsible for, what decision did you personally make, and what evidence best shows the result?”

**Past behaviour:** “Tell me about a specific time when **[job-relevant situation]**. What was your
responsibility, what did you do, why did you choose that approach, and what happened?”

**Situational:** “Suppose **[realistic job situation and constraints]**. What would you do first,
what information would you seek, and how would you decide between the main options?”

**Work-sample reflection:** “Using this bounded task or artefact, show how you would **[important
task]**. Explain assumptions, trade-offs, and how you would verify the result.”

**Contradiction resolution:** “Two authorised sources describe **[matter]** differently: **[neutral
A]** and **[neutral B]**. What context explains the difference, and is there evidence that resolves it?”

## Permitted probes

Use only the probe needed to close a known gap:

- **scope:** What was happening and what constraints mattered?
- **ownership:** What were you personally responsible for?
- **action:** What did you actually do?
- **reasoning:** Which alternatives did you consider and why choose this one?
- **collaboration:** Who else contributed and how were decisions made?
- **outcome:** What changed, and how was that observed or measured?
- **evidence:** Which artefact or person could support this account?
- **reflection:** What did you learn or later change?
- **clarification:** What does this term or statement mean in this context?

In formal evaluation, define allowed probe families in advance and apply equivalent opportunities
to all people. Never disclose a rating anchor or coach toward the expected answer.

## Prioritise questions

Prioritise qualitatively by:

```text
job relevance × uncertainty × expected evidence value
-----------------------------------------------------
candidate burden × sensitivity × duplication
```

This is a decision aid, not a numerical psychometric score.

## Extract evidence

After each response, record separately:

1. verbatim or faithful response record;
2. observable actions and outcomes;
3. evidence references;
4. missing or contradictory information;
5. interpretation linked to a criterion or knowledge predicate;
6. uncertainty and alternative explanations; and
7. next probe or stop reason.

Do not use communication polish as evidence unless oral communication is itself job-relevant and
the response format validly measures it.

## Behavioural anchors

Create anchors with job subject-matter experts before evaluation:

- **below evidence threshold:** behaviour is absent, counterproductive, or unsafe;
- **meets:** behaviour adequately performs the task under normal constraints;
- **strong:** behaviour handles material complexity, trade-offs, and verification well;
- **insufficient evidence:** the response cannot support an inference.

Anchors describe observable behaviour, not personality adjectives. Do not average unlike criteria
without an approved combination rule.

## Stop rules

Stop or defer when the question is not tied to purpose, evidence is outside permission, the person
declines or requests another format, the answer would solicit irrelevant sensitive information, a
criterion is undefined, further probing repeats known information, or a formal comparison would
become materially inconsistent.

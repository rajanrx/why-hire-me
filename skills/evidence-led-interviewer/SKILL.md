---
name: evidence-led-interviewer
description: Conduct or design evidence-led career discovery and structured role evaluation. Use when an agent should explore someone's career evidence, ask high-value follow-up questions, build an interview plan, or draft criterion-level findings. Do not use for casual conversation or unsupported personality profiling.
---

# Evidence-led interviewer

When the optional `why-hire-me-update` skill is installed, use its four-hour cached,
read-only version check once at the start of a task if network access is allowed. Surface a
newer release once, without interrupting this task; update only after the person agrees.
Skip the network check for an offline/private-only request. Never send career content.

Discover defensible evidence about someone's experience, contributions, and growth without
confusing a fluent answer with job capability. Preserve the boundary between person-controlled
knowledge discovery and formal hiring evaluation.

## Choose the mode

### Knowledge discovery

Use when the person is developing their own knowledge base. Act as their partner in making it a
much richer, more accurate record of their career: surface what documents usually omit, help them
remember and articulate it, and leave each episode better evidenced than before. Questions may
adapt to their evidence and answers. Do not score, rank, recommend, or create evaluation findings. Submit new information as
candidate knowledge through the admission boundary.

Reconcile the discovery map as the conversation progresses. Distinct achievements, contextual
technology use, leadership decisions, outcomes, and corrections should have an explicit proposed,
deferred, or excluded disposition; a polished broad summary must not erase a meaningful episode.
If the person asks to reflect reviewed discoveries in a portfolio, route them through
[`output-career-portfolio`](../output-career-portfolio/SKILL.md), never by editing portfolio files
from this interviewer.

### Formal evaluation

Use when findings may influence hiring. Require an identified opportunity, job-relevant criteria,
an authorised evidence view, a declared interview plan, and an accountable human evaluator. If
these are missing, help draft them but label the result `not ready for evaluation`.

Do not silently switch from discovery to evaluation.

## Required context

Before asking questions, assemble only what is authorised and available:

- the mode and purpose;
- role outcomes, important tasks, constraints, stakeholders, and working environment;
- defined criteria and observable indicators, if evaluating;
- the person's evidence map: work, contributions, artefacts, claims, and provenance;
- coverage gaps, ambiguities, contradictions, and stale evidence;
- accessibility needs, response format, time expectations, and allowed tools.

Never treat a job title, résumé keyword, technology tag, employer prestige, or years of experience
as sufficient evidence of capability.

## Question workflow

Read [`references/question-method.md`](references/question-method.md), then:

1. Map each question to one purpose: verify, clarify, deepen, test application, resolve conflict,
   or fill a criterion gap.
2. Size the question set to the chosen depth (see below); within it, prefer high-information
   questions over broad autobiography.
3. Ask for a concrete situation, the person's own responsibility, actions and reasoning,
   constraints/trade-offs, outcome, evidence, and reflection when relevant.
4. Use the permitted probe families. Do not lead the person toward a preferred answer.
5. Separate the response, observed evidence, inference, uncertainty, and any rating.
6. End when material gaps are resolved, evidence is unavailable, the person declines, or further
   questioning would add little value.

Ask one primary question at a time in an interactive interview. For an async question set, keep the
set small, state the criterion and expected effort, and allow equivalent written, audio, video, or
artefact-based responses where feasible.

### Discovery depth

In knowledge discovery, after showing the evidence map and before the first gap question, ask the
person which depth they want, and let them change it at any time:

- **Deep dive** — work through every material gap, role by role and episode by episode. Ask
  many questions: for each episode cover situation, ownership, actions, alternatives considered,
  collaborators, constraints, outcome and how it was observed, evidence, and reflection; follow up
  on every vague, missing, or contradictory answer before moving on. Keep going until each episode
  has a disposition or the person stops.
- **General** — a few high-value questions per role, aimed at the largest gaps in recent and
  recruiter-relevant work; skip episode-level probing and older or low-relevance roles unless the
  person asks.

State the expected effort of each option (rough number of questions or minutes). Record the
choice in the exploration session.

### Answer format: options with free text

In knowledge discovery, offer each question as a short set of answer options plus a free-text
answer, so the person can pick quickly or write their own:

- Use the host's structured question tool when one exists (for example, a multiple-choice prompt
  that always allows an "Other" text answer); otherwise list lettered options and say the person
  can answer in their own words.
- Options describe answer shapes, ranges, or roles (for example "designed the approach", "built
  it", "led the squad that built it", "approximate figure", "no measurement exists"), never a
  preferred or flattering answer. Always include a neutral exit such as "not sure", "can't share",
  or "skip".
- Use multi-select when answers are not mutually exclusive, such as several responsibilities.
- In a deep dive, related questions about the same episode may be grouped (up to about four at
  once) when the host tool supports it; otherwise keep one question at a time.
- Treat a picked option as the person's answer at that level of detail only; probe with free text
  when the option is not specific enough to support a candidate record. Record the person's
  free-text words faithfully, not the option label, when both are given.

### Reconcile each answer with existing evidence

In knowledge discovery, after each answer and before the next question, compare it with the
evidence map and tell the person briefly what you found:

- **aligned** — the answer matches existing records; cite them and note any detail it adds;
- **new** — the answer adds information no record covers; propose it as a candidate;
- **conflict** — the answer differs from an existing record (dates outside a role's period, a
  different title, organisation, figure, scope, ownership, or a technology recorded for another
  role or period). Show both versions neutrally with their sources and ask which holds, with
  options such as "the existing record is right", "my new answer is right", "both are true in
  different contexts", and "not sure". Never silently overwrite either side; record the person's
  resolution, or `unresolved` if they are unsure.

Help the person answer accurately. People misremember dates, figures, and who did what, so offer
recall aids drawn only from their own authorised evidence (the role period, related records,
artefacts, earlier answers) and point out a likely slip, such as a date that falls outside the
role or a figure that differs from the résumé, as a question rather than a correction. Do not
supply an answer they have not given, nudge figures upwards, or treat a mistake as a sign of
dishonesty; the person decides what is correct. Carry unresolved conflicts into the candidate
records' uncertainty.

Formal evaluation keeps open, identical core questions; do not convert core evaluation questions
into multiple choice, because the options would change the construct and could cue the answer.

## Formal-evaluation rules

- Derive criteria and core questions from job analysis, not from the candidate's profile.
- Ask every person the same core questions for the same evaluation plan and use the same anchors.
- Personalised probes may clarify evidence but must not change the construct, difficulty, or help
  one person more than another. Record every probe and why it was selected.
- Rate each criterion from defined evidence after the response; do not use an overall “gut feel”.
- Record `insufficient evidence` instead of converting missing information to a low score.
- Keep AI drafts visibly separate from human findings and decisions.
- Do not produce a composite score, ranking, or hiring recommendation unless a separately approved
  and validated evaluation policy explicitly requires it.

## Prohibited inferences

Do not infer job capability, honesty, personality, intelligence, emotion, health, disability,
protected characteristics, or “culture fit” from appearance, voice, accent, speaking speed,
facial movement, writing polish, camera background, metadata, or other proxies.

Do not ask for irrelevant sensitive information, diagnose the person, use trick questions, or
search beyond authorised sources. Offer a correction/challenge route and reasonable alternative
response modes.

## Persistence

When storing results, read [`references/record-contract.md`](references/record-contract.md).

- Discovery produces evidence, responses, and typed candidate knowledge; it never writes canonical
  knowledge directly.
- Evaluation produces contextual observations and findings tied to the opportunity, criterion,
  question, evidence-view version, and author.
- Every AI action records the model/provider identity available to the adapter, skill version,
  inputs, output, time, and limitations without storing secrets.

## Designing or validating an interview system

Read [`references/scientific-foundations.md`](references/scientific-foundations.md) before creating
criteria, question banks, rating anchors, evaluation policy, or claims about validity and fairness.
Do not call a procedure scientifically valid without evidence for its intended use, population,
setting, and outcomes.

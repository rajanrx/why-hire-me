---
name: daily-work-diary
description: Run a private daily work reflection that reconstructs what someone did, drills into important decisions and learning, and proposes evidence-backed knowledge for review. Use for daily diary, work log, end-of-day reflection, or “what did I do today?” conversations. Do not use for employee surveillance or formal evaluation.
---

# Daily work diary

When the optional `why-hire-me-update` skill is installed, use its four-hour cached,
read-only version check once at the start of a task if network access is allowed. Surface a
newer release once, without interrupting this task; update only after the person agrees.
Skip the network check for an offline/private-only request. Never send career content.

Help a person recover useful knowledge from their day without turning the conversation into a
timesheet, performance score, or transcript dump.

This is an incremental Knowledge Enrichment workflow. It creates a diary entry and candidate
knowledge; it never writes canonical knowledge directly.

## Compose the interviewer

Before drilling into a work episode, read the sibling
[`evidence-led-interviewer`](../evidence-led-interviewer/SKILL.md) skill and its
[`question method`](../evidence-led-interviewer/references/question-method.md). Use only
`knowledge-discovery` mode. Do not produce evaluation criteria, ratings, rankings, or hiring findings.

## Start the session

Establish:

- diary date and timezone when “today” could be ambiguous;
- whether this is private reflection or intended for later sharing;
- desired depth and available time;
- whether the person wants memory prompts from authorised tools.

Default to private. Do not access calendars, files, repositories, messages, or external systems
without the person's explicit scope for this session.

Begin with one open recall question, such as:

> What did you spend meaningful time on today—including progress, decisions, problems, conversations,
> learning, or work that did not go as planned?

Do not assume that a productive day produced a visible deliverable.

## Build the day map

Turn the initial response into a provisional list of work episodes. For each episode, note only what
is known:

- work or goal;
- the person's role and collaborators;
- activity or decision;
- constraints, blockers, or uncertainty;
- outcome or current state;
- available evidence;
- learning or future implication; and
- missing context worth asking about.

Show the day map briefly when confirmation would prevent following the wrong thread.

## Drill down selectively

Choose the episode with the highest combination of significance, novelty, uncertainty, evidence
value, and learning potential. Ask one primary question at a time using the existing interviewer's
probe families.

Useful diary prompts include:

- What changed because of this work?
- What decision did you make, and what alternatives did you reject?
- What was specifically yours versus the team's contribution?
- What constraint or surprising detail shaped the outcome?
- Is there an artefact or source that would help you remember or support this later?
- What did not work, and what did that change in your understanding?
- What should your future self know before continuing?

Do not mechanically ask every prompt. Stop when the episode is clear enough, the person declines,
or another question would add little value. Then offer to explore another episode.

## Optional evidence prompts

When authorised, tools may inspect a calendar, task list, document history, local workspace, Git
activity, or other relevant sources to jog memory. Tool output is evidence, not a complete account
of the day. Absence of commits, meetings, or documents is not evidence that no useful work occurred.

Never capture secrets, unrelated private material, private details about colleagues or clients, or
content outside the granted scope. Prefer references and redacted summaries over copying sensitive
content.

## Close and confirm

Produce a concise proposed diary entry containing:

- day summary;
- work episodes;
- decisions and reasoning;
- progress, outcomes, and blockers;
- learning and changed understanding;
- evidence references;
- unresolved questions; and
- optional next intentions.

Capture consequential technology use, architecture, coordination, and reported user or business
signals as separate episode details when they matter; visible code is not the only evidence of work.
Do not demand that private internal reports be made public to preserve a person-stated observation.

Read [`references/diary-record.md`](references/diary-record.md) before persisting. Ask the person to
correct the summary and choose which extracted items, if any, should be submitted as candidate
knowledge. Silence is not approval.

## Boundaries

- A diary entry is a contemporaneous account, not verified truth.
- Reflection and mood are private unless deliberately shared.
- Tomorrow's intention is not a commitment or performance target.
- Do not infer effort, productivity, capability, or wellbeing from activity traces.
- Do not reuse diary content for formal evaluation without a new explicit grant.
- Preserve corrections; do not silently rewrite an earlier confirmed entry.
- A diary correction or candidate does not directly revise an existing portfolio. After review and,
  in governed mode, curation, route any requested portfolio change through
  [`output-career-portfolio`](../output-career-portfolio/SKILL.md), the sole local update gateway.

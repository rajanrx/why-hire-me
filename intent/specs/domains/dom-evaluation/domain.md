---
id: dom-evaluation
status: draft
date: 2026-09-13
prd_goals: [G-2, G-3, G-4, G-5]
---

# Evaluation

## Purpose

Help an evaluator understand a person's fit for a specific opportunity through a transparent,
evidence-led process that can run asynchronously.

An interview is one evaluation method. The domain also allows evidence exploration, work samples,
references, and future methods without treating any result as a universal judgement of the person.

## Owns

- opportunity and evaluation context;
- declared criteria and their relevance to the opportunity;
- evaluation plan and method;
- interview questions, responses, and follow-ups;
- the versioned person-knowledge view used as evidence;
- criterion-level findings and their citations;
- evaluator outcome, rationale, authorship, and challenge history.

It does not own the person's canonical knowledge or silently amend it.

## Core concepts

| Concept | Meaning |
|---|---|
| **Opportunity** | The role or purpose for which a person is being evaluated. |
| **Criterion** | A declared, role-relevant quality or capability to investigate. |
| **Evaluation** | One time-bounded assessment of one person for one opportunity. |
| **Method** | An interview, evidence review, work sample, reference, or other assessment activity. |
| **Question** | A prompt linked to one or more declared criteria. |
| **Response** | The person's answer or submitted artefact, with provenance. |
| **Evidence view** | The frozen, authorised version of person knowledge available to the evaluation. |
| **Finding** | An attributable interpretation about a criterion, supported by cited evidence. |
| **Outcome** | The accountable evaluator's contextual conclusion and rationale. |

## Core rules

1. Every evaluation identifies its opportunity, criteria, evidence-view version, and accountable
   evaluator.
2. A finding applies only within its evaluation; it is not a permanent attribute of the person.
3. Criteria are declared before findings and cannot be silently changed after responses arrive.
4. Questions and findings link to their criteria.
5. AI-generated questions, summaries, or draft findings are labelled and reproducible from recorded
   inputs where practical.
6. A finding cites supporting or contradicting evidence and can record uncertainty.
7. The person can identify AI involvement and use a defined correction or challenge path.
8. Protected or sensitive characteristics and their proxies must not be used unless a separately
   approved, lawful purpose explicitly requires them.
9. No universal candidate score exists in this domain.

Formal interviews follow
[`std-evidence-led-interview`](../../standards/evaluation/std-evidence-led-interview.md) and use the
shared `evidence-led-interviewer` skill without granting it decision authority.

## Async interview journey

1. The evaluator defines the opportunity, criteria, and evaluation method.
2. The person grants a bounded evidence view for that evaluation.
3. AI helps the evaluator explore evidence and draft relevant questions.
4. The person responds in their own time and may link further evidence.
5. AI may organise the responses and draft criterion-level findings with citations.
6. The accountable evaluator reviews, changes, or rejects those findings and records an outcome.
7. The person can see the agreed level of rationale and use the defined challenge path.

## Open questions

- Who defines and approves criteria?
- Does the person see questions, findings, rationale, and outcome by default?
- Can the evaluator use evidence outside the person-authorised view?
- What is AI allowed to draft, and what always requires human authorship?
- How are accessibility accommodations and alternative response modes represented?
- How long are evaluation records retained, and who controls deletion?

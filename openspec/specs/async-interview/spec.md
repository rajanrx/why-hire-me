# async-interview Specification

## Purpose
Define a structured, accessible, and accountable asynchronous interview workflow that preserves
formal evaluation readiness, comparable questioning, separated evidence records, and human outcomes.

## Requirements

### Requirement: Operating mode is explicit

The skill SHALL use exactly one of prepare, facilitate, or review mode and MUST NOT switch silently.

#### Scenario: A user asks to run an interview without a plan

- **WHEN** evaluation readiness is incomplete
- **THEN** the skill remains in prepare mode and reports not ready for evaluation

### Requirement: Formal evaluation has a readiness gate

The skill SHALL require approved opportunity analysis, criteria, core questions, probes, anchors,
evidence view, policy, accountable evaluator, notice, accommodations, retention, and challenge process.

#### Scenario: Rating anchors are missing

- **WHEN** facilitation is requested
- **THEN** formal evaluation does not begin until approved anchors exist

### Requirement: Asynchronous delivery is transparent and accessible

The skill SHALL state effort, formats, deadline and time zone, pause and resume, support, technical
requirements, retention, next steps, and available adjustments.

#### Scenario: The interface creates an accessibility barrier

- **WHEN** an equivalent format can preserve the criterion
- **THEN** the participant receives that format without negative evaluation

### Requirement: Core content and probing remain comparable

The skill SHALL present equivalent approved core content and SHALL use only criterion-linked allowed
probe families with equivalent opportunities to clarify.

#### Scenario: One response is ambiguous

- **WHEN** a probe is warranted
- **THEN** the skill selects an allowed probe and records it without inventing a new criterion

### Requirement: Evaluation records remain separated

The skill SHALL preserve delivery event, response, observation, finding, rating, AI draft, human
disposition, and outcome as distinct attributable records.

#### Scenario: A technical interruption occurs

- **WHEN** the session pauses unexpectedly
- **THEN** the event is recorded operationally and not treated as low performance

### Requirement: Prohibited inferences are refused

The skill MUST NOT infer protected traits, health, neurotype, personality, honesty, emotion, cultural
fit, or future performance from language, media, timing, or metadata.

#### Scenario: An evaluator asks for emotion analysis

- **WHEN** video is available
- **THEN** the skill refuses and continues only with declared job-relevant evidence

### Requirement: Outcome remains accountable and contestable

The skill MUST NOT rank people or create, communicate, or act on a hiring outcome and SHALL preserve
the declared correction, challenge, accessibility, and human-review routes.

#### Scenario: Review findings are drafted

- **WHEN** AI-assisted findings are ready
- **THEN** only the named accountable human can adopt them and determine an outcome

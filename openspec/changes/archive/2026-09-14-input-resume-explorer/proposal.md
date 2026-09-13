## Why

A résumé is the first source in the reference journey, but a generic AI summary would lose source
locations, identity ambiguity, uncertainty, review state, and the difference between supplied text
and inferred meaning.

## What Changes

- Add the `input-resume-explorer` skill for private, evidence-led résumé discovery.
- Support governed-import and honest session-only modes based on available host tools.
- Map résumé content to the controlled career entity model with precise source locators.
- Compose evidence-led follow-up questions without entering formal evaluation.
- Produce reviewable entity and claim proposals without bypassing admission.

Non-goals: résumé rewriting, unsupported external research, credential verification, scoring,
formal evaluation, automatic admission, or publication.

## Capabilities

### New Capabilities

- `input-resume-explorer`: Evidence-linked exploration of an authorised résumé or CV.

### Modified Capabilities

- `plugin-distribution`: Package and advertise the new available skill.

## Impact

Adds one standalone input workflow and record contract. It uses host document readers or governed
capture tools when available without making a file format, AI host, or persistence adapter part of
the skill contract.

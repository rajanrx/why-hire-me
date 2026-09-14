---
id: adr-0020
status: accepted
date: 2026-09-15
owner: product
supersedes: adr-0015
---

# ADR-0020: Use a source-available personal-use licence

## Context

The project owner wants people to inspect and use Why Hire Me without a fee for qualifying personal
and non-commercial purposes, while reserving modification, redistribution, professional use, and
commercial use for separately negotiated terms. Those restrictions are incompatible with the Open
Source Definition, so describing the software as open source would be misleading.

The project also needs a privacy-preserving way to discover intact public outputs without covert
telemetry or network requests from a person's portfolio.

## Decision

Publish the repository under PolyForm Strict License 1.0.0 and describe it as source-available.
Qualifying non-commercial use is permitted under that licence. The public licence does not grant
permission to modify or redistribute the software. Uses outside its permitted purposes—including
commercial, professional, recruiting, consulting, and internal-business uses—require a separate
written paid licence from the licensor.

Keep the separate trademark policy for the Why Hire Me identity. Embed the non-personal marker
`why-hire-me.build/v1` in governed portfolio outputs and provide an operator-run public GitHub code
search. Do not add analytics, cookies, fingerprinting, or phone-home behaviour.

## Consequences

- Source remains publicly inspectable, but the project is not OSI-approved open source.
- The public licence does not authorise modified or redistributed forks.
- A public GitHub repository can still expose a technical Fork action; legal permission and hosting
  platform mechanics remain different boundaries.
- Commercial terms, pricing, compliance, and enforcement remain outside the public licence text.
- Public-marker discovery is best-effort, cannot see private use, and is removable.
- Hiring safeguards still require architecture, product policy, consent, and accountable human use;
  copyright licensing alone cannot make hiring decisions safe.

## Rejected directions

- AGPL was superseded because it permits commercial use, modification, and redistribution when its
  reciprocity conditions are followed.
- A custom “ethical source” licence was rejected in favour of a published, standard-form licence.
- Covert telemetry was rejected because it conflicts with local-first privacy and is not reliable
  licence enforcement.

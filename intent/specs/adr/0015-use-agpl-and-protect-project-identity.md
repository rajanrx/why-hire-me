---
id: adr-0015
status: superseded
date: 2026-09-14
owner: product
supersededBy: adr-0020
---

# ADR-0015: Use AGPL and protect project identity

## Context

The project should remain genuinely open source while discouraging closed hosted forks, misleading
copies, and unsafe use of the official identity. An open-source licence cannot prohibit copying,
redistribution, commercial activity, people, or fields of use.

## Decision

Licence the software under GNU Affero General Public License version 3 or any later version. A
separate trademark policy reserves the Why Hire Me name and branding for the official project while
allowing truthful statements about origin and compatibility.

AGPL reciprocity is the code boundary: distributed modifications remain under the same terms, and
operators of modified network services offer corresponding source to their users. Trademark is the
identity boundary: independent versions use a distinct name and cannot imply official approval.

Hiring safeguards remain architecture and service-policy concerns. The licence does not attempt to
restrict a field of use, which would make the project source-available rather than open source.

## Consequences

- Anyone may use, inspect, modify, and redistribute the software under AGPL terms.
- Modified network services must offer their corresponding source as the AGPL requires.
- Forks can exist but cannot present themselves as the official Why Hire Me product.
- The licence alone cannot prevent harmful or discriminatory hiring use.
- Hosted offerings need acceptable-use terms, enforcement, consent, and audit controls.

## Rejected directions

- MIT was rejected because it permits closed modified distributions and hosted derivatives.
- No-redistribution and ethical-use clauses were rejected because they are incompatible with the
  Open Source Definition.

---
id: adr-0003
status: proposed
date: 2026-09-13
owner: product/architecture
---

# ADR-0003: Separate person knowledge from evaluation

## Context

Evidence about a person's work is reusable. A hiring assessment is meaningful only for a particular
opportunity, criteria set, evaluator, evidence view, and point in time. Treating an assessment as a
property of the person would erase that context and allow one evaluator's judgement to contaminate
future uses.

AI-assisted recruitment is consequential. Depending on use and jurisdiction it can attract
heightened obligations. The EU AI Act identifies many recruitment and candidate-evaluation systems
as high-risk, and Australian Human Rights Commission guidance highlights privacy, fairness,
transparency, contestability, accountability, and human control.

## Decision

Create separate `Person Knowledge` and `Evaluation` domains.

- Evaluation reads a versioned, authorised evidence view; it does not read all person knowledge.
- Criteria, questions, responses, findings, and outcomes belong to the evaluation context.
- Findings never become canonical claims about the person automatically.
- AI may propose questions, retrieve evidence, summarise responses, and draft findings.
- Every consequential finding identifies whether it was human-authored or AI-assisted and links to
  evidence.
- Any future automated scoring, ranking, or recommendation requires a new explicit decision and
  validation regime.

## Consequences

- The same knowledge can support different roles without creating a universal person score.
- Evaluations can be reproduced against the evidence version used at the time.
- Access, retention, and contest rules can differ between personal knowledge and employer records.
- Cross-domain exchange requires stable view and citation contracts.

## References

- [EU Artificial Intelligence Act](https://eur-lex.europa.eu/eli/reg/2024/1689/oj)
- [Australian Human Rights Commission: AI and recruitment](https://humanrights.gov.au/resource-hub/technology-and-human-rights/ai-and-recruitment-compliance-checklist)
- [NIST AI RMF Core](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/)

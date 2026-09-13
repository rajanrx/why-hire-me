# Evidence-led professional interviewing

## Executive findings

An expert interview system should not optimise for asking more questions or producing a plausible
personality portrait. It should improve the quality of a defined inference: what evidence supports
a job-relevant conclusion, how reliable that conclusion is, and what remains unknown.

The strongest established direction is structured, job-related assessment. Questions are derived
from important work, people receive comparable opportunities, responses are rated against
pre-defined behavioural anchors, and evidence is recorded before overall judgement. Research
reviews consistently find that structure improves the psychometric quality of employment
interviews.^1,2 U.S. Office of Personnel Management guidance operationalises this as job analysis,
job-related competencies, consistent questions, controlled probes, and common rating scales.^3

Recent meta-analytic work cautions against repeating simple league tables of selection methods as
universal truth. Corrections used in older meta-analyses sometimes inflated estimates, and validity
varies with method, criterion, job, sample, and study design.^4,5 A procedure is not “scientific”
because it resembles one from a paper; it needs evidence for its intended inference and use.

The platform therefore needs two explicitly different modes:

- **knowledge discovery**, which adaptively uncovers and verifies information for the person; and
- **formal evaluation**, which supports a consequential assessment for a defined opportunity.

Discovery produces candidate knowledge, never a score. Formal evaluation uses declared criteria,
standardised core questions, anchored ratings, documented AI assistance, and an accountable human.

## 1 · What validity means

Validity is evidence supporting the interpretation and use of results. It is not a permanent badge
attached to a question or model. SIOP's Principles frame personnel selection around evidence for
the proposed interpretation and use, and SIOP's AI guidance says AI-based assessments require the
same scrutiny as traditional selection procedures.^6,7

Validation should distinguish:

- **content evidence:** questions and tasks represent important work;
- **criterion-related evidence:** results predict or relate to relevant outcomes;
- **construct evidence:** the procedure measures the intended capability rather than irrelevant
  variance such as speaking polish or interview familiarity;
- **reliability:** results are sufficiently consistent across raters, occasions, or equivalent
  forms for their use;
- **fairness and impact:** people receive equitable opportunity and outcomes are monitored for
  harmful group differences and accessibility barriers; and
- **utility:** information gained justifies burden, time, privacy cost, and complexity.

Claims must match evidence. Until local outcome studies exist, describe a process as
“research-informed and structured”, not “proven predictive”.

## 2 · Begin with work, not biography

Selection content should arise from job analysis: important outcomes and tasks, their context and
frequency, consequences of error, and the knowledge or behaviours needed to perform them. OPM
guidance and U.S. selection guidance emphasise job-related competencies and consistent standards.^3,8

A generic role model should capture:

| Dimension | Questions for the role model |
|---|---|
| Outcomes | What must become true because this person did the work? |
| Tasks | What do they repeatedly decide, create, diagnose, communicate, or operate? |
| Context | Under what scale, uncertainty, time, safety, regulatory, or resource constraints? |
| Stakeholders | Whose needs conflict, and with whom must the person coordinate? |
| Evidence | What observable work would demonstrate effective performance? |
| Failure | Which mistakes matter, and what controls are expected? |
| Learning | How quickly do tools and conditions change? |

This makes the system role-generic. A software engineer may provide repositories and incident
records; a designer may provide research and design artefacts; an accountant may provide analyses
and controls; a salesperson may provide account strategies and outcomes. The core asks about
important work, not software-specific signals.

## 3 · Define observable criteria

Criteria should be limited to capabilities genuinely needed for the opportunity and defined in
observable terms. “Culture fit”, “smart”, “senior”, and “good communicator” are too ambiguous.

Each criterion needs:

- a definition and boundary from adjacent criteria;
- a documented link to important work;
- positive and counter-indicators;
- evidence types that can support it;
- behavioural anchors appropriate to the required proficiency;
- accessibility and irrelevant-variance risks; and
- a rule for insufficient evidence.

For example, replace “technical leadership” with observable behaviours such as framing a decision,
eliciting constraints, comparing alternatives, enabling contributors, monitoring the outcome, and
correcting course. Do not require that evidence to use one fashionable technology.

## 4 · Structure improves the interview

Campion, Palmer, and Campion identified components of structure affecting interview content and
evaluation, including job-analysis-based questions, consistent questions, controlled probing,
better question types, anchored rating scales, detailed notes, interviewer training, and systematic
combination of ratings.^1 Later review supports the importance of structure while examining
impression management, question type, probing, rating, and candidate reactions.^2

The design pattern is:

```text
job analysis -> criterion -> question -> permitted probes -> observable evidence
             -> behavioural anchors -> independent rating -> documented synthesis
```

Structure is not identical wording at all costs. Formal evaluation needs comparable core content
and opportunity. A clarification or accommodation may vary in form while preserving the construct.
The platform should record why a variation occurred.

## 5 · Question types have different uses

### Past behaviour

Ask for a concrete prior situation and what the person did. This can expose behaviour,
responsibility, reasoning, outcome, and evidence. Its limitation is opportunity: a capable person
may not have encountered the exact situation, and memory or storytelling skill can influence the
response.

### Situational

Present a realistic future problem. This supports consistent comparison and people without
identical prior opportunities, but measures intended behaviour and reasoning more than demonstrated
past performance. Past-behaviour and situational questions should not be assumed interchangeable
even when aimed at the same attribute.^9,10

### Work samples

Representative tasks observe performance more directly and belong alongside interviews when a
criterion is demonstrable. They should be bounded, accessible, proportionate, and not extract free
production work. Recent corrections to meta-analytic estimates still place job-specific methods,
including structured interviews and work samples, among important selection predictors, while
warning against universal rankings.^4,5

### Evidence drill-down

This platform can begin with authorised work evidence. Questions should separate personal
contribution from team output, recover decisions and constraints absent from the artefact, and
identify outcome evidence. Repository quantity, employer prestige, presentation quality, or tool
choice does not by itself establish capability.

### Job knowledge and reflection

Use job-knowledge questions when knowledge is truly required and ask the person to apply or reason,
not recite trivia. Use reflection to investigate learning from a concrete event; reflection alone
does not prove that later behaviour changed.

## 6 · Adaptive questioning without losing comparability

Adaptive questioning suits knowledge discovery because the goal is coverage and clarity. The agent
can pursue the most informative unresolved lead.

Formal evaluation is different. Every person should receive the same core questions and scoring
anchors. Adaptive probes should come from pre-declared families—scope, ownership, action,
reasoning, collaboration, outcome, evidence, reflection, and clarification—and must not change the
criterion or coach a preferred response. OPM recommends defining probing policy in advance and
using comparable probes.^3

For formal use, log the selected probe, the evidence gap that triggered it, whether another person
would receive an equivalent probe, whether it changed time or information available, and how any
deviation affects comparison.

This is the central compromise: fixed core measurement with bounded evidence-sensitive follow-up.

## 7 · Rating and synthesis

Rate observable evidence criterion by criterion. Anchors should be created with job subject-matter
experts and describe behaviour at meaningful proficiency levels. OPM notes that customised scales
require subject-matter expertise and representative responses.^11

Keep these distinct:

```text
response != observation != evidence != inference != uncertainty != rating != decision
```

Practices include recording observations before impressions, rating against the relevant anchor,
forming independent judgements before panel discussion, using `insufficient evidence` instead of a
forced low rating, recording contradictions, and not combining criteria without a justified rule.
An AI narrative must not hide the underlying evidence or ratings.

A high-quality answer is not necessarily evidence of high performance. Content must demonstrate
the observable behaviour required by the criterion.

## 8 · AI's appropriate role

AI can help by mapping authorised evidence to criteria; identifying missing ownership, decisions,
constraints, outcomes, or proof; choosing a permitted follow-up; generating role-equivalent draft
questions; locating contradictory or stale evidence; structuring responses into observations; and
drafting, but not adopting, criterion-level findings.

AI should not:

- invent criteria from correlations in historical hiring data;
- infer personality, emotion, honesty, intelligence, disability, or protected traits from video,
  voice, face, accent, style, metadata, or proxies;
- treat fluency, verbosity, confidence, or similarity to past employees as merit;
- search outside authorised evidence;
- make an unattributed consequential decision;
- learn silently from outcomes and feed them into later scoring; or
- claim validity or fairness from face validity, vendor assertions, or a small demo.

SIOP recommends that AI-based assessments be job-related, predictive for relevant outcomes,
consistent, fair, and documented for audit.^7 NIST calls for explicit human-AI roles, documented
limitations, validity and reliability evaluation, transparency, and ongoing risk management.^12

## 9 · Fairness, privacy, and accessibility

Fairness is not achieved by removing protected attributes from a prompt. Other variables can act as
proxies, source availability differs, and apparently neutral requirements can create unequal barriers.

At minimum:

- collect only job-relevant information for a declared purpose;
- explain what AI does, what evidence is used, and who decides;
- offer accessible and substantively equivalent response formats;
- provide accommodations and do not score the accommodation itself;
- separate missing opportunity from missing capability;
- monitor completion, ratings, progression, and errors for meaningful group differences;
- maintain correction, challenge, and human-review routes;
- set retention and secondary-use boundaries; and
- test transcription, retrieval, and scoring across relevant language, accent, disability, and
  technology-access conditions.

EEOC guidance warns that algorithmic hiring tools can screen out people with disabilities, for
example when speech patterns proxy for problem solving.^13 The Australian Human Rights Commission
stresses privacy, fairness, transparency, challenge, accountability, accessibility, and human
control.^14 The UK ICO calls for data minimisation, transparency, fairness and bias monitoring,
impact assessment, and challenge mechanisms.^15 The EU AI Act treats many AI systems used for
recruitment or candidate evaluation as high-risk, depending on intended use.^16

These are governance inputs, not jurisdiction-specific legal advice.

## 10 · Candidate experience affects measurement

Burden and perceived fairness affect participation, effort, completion, and therefore observed
data. Asynchronous formats can improve flexibility, but evidence about their design, validity,
bias, and reactions is less mature than the broader structured-interview evidence; some studies
report less favourable reactions to asynchronous or highly automated formats.^17,18

Explain purpose, criteria, AI role, effort, and review. Let people pause and request another format.
Avoid unlimited unpaid tasks and repetitive questions. Distinguish asynchronous evidence dialogue
from one-way video screening, and measure abandonment and experience—not only recruiter efficiency.

## 11 · Validation and monitoring

Before consequential use, maintain an evidence dossier containing:

1. purpose, population, setting, and decision consequences;
2. job analysis and criterion definitions;
3. question and anchor development, including subject-matter experts;
4. administration, probing, accommodation, and scoring rules;
5. model, skill, retrieval, and connector versions;
6. validity and reliability evidence appropriate to claims;
7. fairness, accessibility, privacy, and security evaluation;
8. rater training and calibration;
9. monitoring for drift, probing differences, overrides, challenges, and adverse impact; and
10. change control, rollback, incidents, and retirement criteria.

The U.S. Uniform Guidelines provide one jurisdiction-specific framework for job relatedness,
validation, records, and adverse-impact analysis.^8 Their four-fifths rule is a screening convention,
not a universal scientific definition of fairness; smaller or statistically/practically meaningful
differences can still matter, and small samples make ratios unstable.^8

Operational measures include criterion coverage, evidence completeness, inter-rater agreement,
anchor and probe consistency, citation correctness, unsupported-inference rate, insufficient-
evidence and override rates, candidate burden and challenges, group differences with uncertainty,
and relationships to relevant later outcomes when lawful and methodologically defensible.

## 12 · Architectural implications

- Role analysis and criteria belong to Evaluation, not Person Knowledge.
- Adaptive discovery belongs to Knowledge Enrichment.
- Source access belongs to Evidence Acquisition.
- Responses remain evidence until admitted.
- Formal findings remain contextual and never become person truth automatically.
- Question generation consumes a versioned interview blueprint, not a job title.
- Rating consumes a versioned criterion, anchor set, response, and evidence view.
- AI output is a proposal with provenance and human disposition.
- Access is applied before retrieval and questioning.

This architecture supports deep personalised inquiry without sacrificing fair comparison.

## 13 · Limits

- Results are averages across heterogeneous jobs, samples, outcomes, and interview designs.
- Predictive validity estimates changed as correction methods were revisited.
- Structured interviews can still encode poor criteria or biased anchors.
- Historical performance ratings may themselves be noisy or biased.
- Research on generative-AI interview agents and asynchronous modalities is developing.
- Legal requirements vary and change.
- No source supports treating an LLM's confidence as psychometric reliability.

The defensible conclusion is not that interviews are objective. Job analysis, structure, evidence
separation, anchored judgement, accessibility, transparency, and ongoing validation make the
process more testable than improvisation.

## Sources

1. Campion, M. A., Palmer, D. K., & Campion, J. E. “[A Review of Structure in the Selection Interview](https://doi.org/10.1111/j.1744-6570.1997.tb00709.x).” *Personnel Psychology*, 1997.
2. Levashina, J., Hartwell, C. J., Morgeson, F. P., & Campion, M. A. “[The Structured Employment Interview](https://doi.org/10.1111/peps.12052).” *Personnel Psychology*, 2014.
3. U.S. Office of Personnel Management. “[Structured Interview Guide](https://www.opm.gov/policy-data-oversight/assessment-and-selection/structured-interviews/guide.pdf).” 2008.
4. Sackett, P. R., Zhang, C., Berry, C. M., & Lievens, F. “[Revisiting Meta-Analytic Estimates of Validity in Personnel Selection](https://doi.org/10.1037/apl0000994).” *Journal of Applied Psychology*, 2022.
5. Sackett, P. R., Lievens, F., Van Iddekinge, C. H., & Kuncel, N. R. “[Hiring People in Organizations](https://doi.org/10.1146/annurev-orgpsych-020924-072127).” *Annual Review of Organizational Psychology and Organizational Behavior*, 2026.
6. Society for Industrial and Organizational Psychology. “[Principles for the Validation and Use of Personnel Selection Procedures](https://doi.org/10.1017/iop.2018.195).” Fifth edition, 2018.
7. Society for Industrial and Organizational Psychology. “[AI-Based Assessments for Employee Selection](https://www.siop.org/wp-content/uploads/legacy/SIOP%20Considerations%20and%20Recommendations%20for%20the%20Validation%20and%20Use%20of%20AI-Based%20Assessments%20for%20Employee%20Selection%20010323.pdf).” 2023.
8. U.S. Equal Employment Opportunity Commission et al. “[Uniform Guidelines on Employee Selection Procedures](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XIV/part-1607).” 29 CFR Part 1607.
9. Taylor, P. J., & Small, B. “[Asking Applicants What They Would Do Versus What They Did Do](https://doi.org/10.1348/096317902320369712).” *Journal of Occupational and Organizational Psychology*, 2002.
10. Culbertson, S. S., Weyhrauch, W. S., & Huffcutt, A. I. “[A Tale of Two Formats](https://doi.org/10.1016/j.hrmr.2016.09.003).” *Human Resource Management Review*, 2017.
11. U.S. Office of Personnel Management. “[Developing a Customised Rating Scale](https://www.opm.gov/frequently-asked-questions/assessment-policy-faq/structured-interviews/how-do-i-develop-a-customized-rating-scale-for-structured-interviews/).”
12. National Institute of Standards and Technology. “[AI Risk Management Framework Core](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/).”
13. U.S. Equal Employment Opportunity Commission. “[Artificial Intelligence and the ADA](https://www.eeoc.gov/eeoc-disability-related-resources/artificial-intelligence-and-ada).” 2022.
14. Australian Human Rights Commission. “[AI and Recruitment Compliance Checklist](https://humanrights.gov.au/resource-hub/technology-and-human-rights/ai-and-recruitment-compliance-checklist).” 2024.
15. UK Information Commissioner's Office. “[AI Tools Used in Recruitment](https://ico.org.uk/action-weve-taken/audits-and-overview-reports/2024/11/ai-tools-used-in-recruitment/).” 2024.
16. European Union. “[Regulation (EU) 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj).” 2024.
17. Basch, J. M., Melchers, K. G., Kegelmann, J., & Lieb, L. “[Smile for the Camera?](https://doi.org/10.3389/fpsyg.2020.602778).” *Frontiers in Psychology*, 2020.
18. Lukacik, E.-R., Bourdage, J. S., & Roulin, N. “[Into the Void](https://doi.org/10.1016/j.hrmr.2020.100789).” *Human Resource Management Review*, 2022.

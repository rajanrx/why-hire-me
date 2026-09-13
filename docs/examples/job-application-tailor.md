# Job application tailor example

The workflow accepts one authorised job description from a URL, PDF, DOCX, plain-text file, or
pasted text that the AI host can read. It treats the description as opportunity evidence—not as
career truth—and uses only a bounded view of reviewed career knowledge for application claims.

## Prompt

```text
Use why-hire-me:job-application-tailor for this job description: <URL or attached file>.
Use only my reviewed career knowledge. Separate essential, preferred, and contextual requirements;
show strong evidence, partial evidence, genuine gaps, and questions that could resolve uncertainty.
Then draft a concise tailored résumé and cover letter. Do not invent experience or hide gaps.
```

## Expected plan

```yaml
opportunity:
  title: Head of IT
  source: authorised job description
requirements:
  - id: R1
    kind: essential
    requirement: Lead technology strategy and roadmap execution.
    evidenceStatus: supported
    evidence: [reviewed contribution C-14, reviewed work W-03]
  - id: R2
    kind: essential
    requirement: Operate a named enterprise finance platform.
    evidenceStatus: insufficient-evidence
    evidence: []
    nextQuestion: Have you used an equivalent platform in a comparable operating context?
evaluation:
  scope: this opportunity only
  strengths: [technology strategy, security governance]
  gaps: [direct evidence for the named finance platform]
  uncertainty: [scale of vendor budget ownership]
```

The generated résumé should prioritise supported evidence relevant to the role while preserving
dates, employers, and meaning. The cover letter may connect that evidence into a narrative, but it
must not turn `partial` or `insufficient-evidence` into a claim. Each material sentence should be
traceable to the role requirement and reviewed career knowledge.

The workflow also returns a claim trace so each material résumé and cover-letter statement can be
checked against a requirement and career record. It prepares documents; it does not submit an
application, contact an employer, or publish private knowledge.

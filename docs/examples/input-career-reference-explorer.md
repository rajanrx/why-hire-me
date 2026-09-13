# Career reference explorer example

Use this skill for a portfolio page, publication, credential record, professional profile, or other
specific career reference.

## Prompt

```text
Use why-hire-me:input-career-reference-explorer on this public credential URL.
Keep the result private. Read only this page first, preserve the credential identifier and validity
dates, and ask before following any linked issuer or verification page. Do not treat a matching name
as proof that the credential belongs to me.
```

## Expected response

```yaml
mode: session-only
status: not-persisted
sources:
  - requestedLocator: https://credentials.example/record/123
    sourceRelationship: issuer-controlled
    access: public
    retrievedAt: 2026-09-14T09:30:00Z
observations:
  - text: The issuer page displays a named certification and issue date.
    locator: credential details
    state: publisher-asserted
    subjectIdentity: ambiguous
entityProposals:
  - entityType: Credential
    proposedName: Example professional certification
    originalIdentifiers: [123]
    evidenceLocators: [credential details]
    uncertainty:
      level: medium
      rationale: The issuer assertion is visible, but the subject identity is not yet linked.
    reviewRequired: true
questions:
  - What evidence links this credential record to you, and may I inspect that specific source?
```

If a separately authorised issuer check succeeds, the relevant observation may become
`independently-verified`. The skill still stages a proposal for review; it does not admit career
knowledge automatically.

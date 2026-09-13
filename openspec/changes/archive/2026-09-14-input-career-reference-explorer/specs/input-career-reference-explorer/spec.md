## ADDED Requirements

### Requirement: Reference authority is bounded

The skill SHALL confirm purpose, privacy, and the exact authorised URL or identifier and MUST NOT
treat one reference as permission to crawl, authenticate, download software, or collect unrelated data.

#### Scenario: A portfolio page links to several sites

- **WHEN** the page is authorised
- **THEN** linked sites remain unvisited leads until separately authorised

### Requirement: Source identity and freshness are preserved

The skill SHALL record available requested and canonical locators, redirects, publisher, retrieval
time, dates, access state, digest, stable locator, and reader limitations.

#### Scenario: A page redirects to a canonical credential record

- **WHEN** the reference is retrieved
- **THEN** both the requested locator and resolved canonical locator remain attributable

### Requirement: Operating mode is honest

The skill SHALL use `governed-import` only when capture and staging preserve required provenance and
SHALL otherwise return a `session-only`, `not-persisted` preview.

#### Scenario: A browser can display but not capture a page

- **WHEN** the page is explored
- **THEN** the skill does not claim that the reference was imported, stored, admitted, or verified

### Requirement: Assertion, identity, and verification remain distinct

The skill SHALL distinguish observed, publisher-asserted, identity-linked, independently-verified,
and unresolved states and MUST NOT infer them from appearance, logos, search ranking, or name match.

#### Scenario: An issuer page displays a matching name

- **WHEN** no separate identity evidence is available
- **THEN** the credential may be publisher-asserted while subject identity remains ambiguous

### Requirement: Access barriers fail closed

The skill SHALL stop on authentication, CAPTCHA, payment, unsafe redirect, or permission requirements
outside the stated scope and SHALL report the blocker without substituting snippets or mirrors silently.

#### Scenario: A credential page requires sign-in

- **WHEN** sign-in was not authorised
- **THEN** the result is blocked and no access workaround is attempted

### Requirement: Admission and evaluation remain separate

The skill SHALL stage supported proposals through existing candidate boundaries where available and
MUST NOT automatically admit, publish, background-check, or formally evaluate the person.

#### Scenario: Independent verification succeeds

- **WHEN** a separately authorised method confirms a claim
- **THEN** the verification event supports a reviewable proposal but does not admit it

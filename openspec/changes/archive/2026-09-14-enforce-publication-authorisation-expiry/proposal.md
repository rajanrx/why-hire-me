## Why

Content integrity does not prove that a disclosure grant is still active. Portfolio generation and
hosted publication must stop when the authorised view expires, even when all stored bytes remain valid.

## What Changes

- Carry disclosure expiry into the portfolio manifest and its deterministic identity.
- Reject portfolio generation from an expired release.
- Reject destination publication after the portfolio authorisation expires.
- Keep timeless integrity validation separate from time-bound use authority.

## Capabilities

### Modified Capabilities

- `career-portfolio-output`: Require current disclosure authority for generation and publication.

## Impact

Adds an injected clock to portfolio generation and publication validation without changing the
release bytes, canonical knowledge, or destination adapter boundary.

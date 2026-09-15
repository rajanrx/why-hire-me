# Two-repository development contract

This public `rajanrx/why-hire-me` repository owns runtime code, skills, templates,
tests, packages, and releases. Product intent and the complete OpenSpec record live
in the private `rajanrx/why-hire-me-intent` repository. When authorised for design
work, use sibling checkouts at `../why-hire-me` and `../why-hire-me-intent`.

Inspect both repositories for a capability change, but edit each in its owning
repository. Do not copy private intent, OpenSpec proposals/designs/reviews, or
implementation rationale back into this public repository, public releases, or
career portfolio output without a separate disclosure review. Public code, tests,
and skills must remain usable without private-repository access.

`pnpm run check` builds and tests this repository. Its `spec:validate` step checks
the private sibling only when it is available and prints an explicit skip otherwise.
Before a maintainer release, run `pnpm run spec:validate:private` with the sibling
checkout, or set `WHY_HIRE_ME_PRIVATE_DESIGN_ROOT` to its exact local path. A skip
is not a successful private design validation.

Use codebase-memory through a repository-provided one-shot CLI when present; do
not register or enable its MCP server. Fall back to `rg` for literals, non-code
files, or graph coverage gaps.

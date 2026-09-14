# Canonical career portfolio template

The production renderer is the template source of truth. It generates the same compact, light,
four-lens interface for every validated career release; portfolio content changes, but the approved
visual and interaction contract does not drift.

The reusable pieces are:

- [`../../src/adapters/publication/static-html-career-portfolio-renderer.ts`](../../src/adapters/publication/static-html-career-portfolio-renderer.ts) — production HTML, CSS, and interaction renderer;
- [`../../skills/output-career-portfolio/assets/template-contract.json`](../../skills/output-career-portfolio/assets/template-contract.json) — machine-readable design contract;
- [`../../skills/output-career-portfolio/assets/sample-release.json`](../../skills/output-career-portfolio/assets/sample-release.json) — fictional graph-shaped sample data; and
- [`../../scripts/portfolio/generate-sample.mjs`](../../scripts/portfolio/generate-sample.mjs) — deterministic sample generator.

To generate the sample into a new content-addressed directory:

```bash
pnpm portfolio:sample -- /tmp/why-hire-me-sample
```

The command builds the TypeScript implementation first. It never writes to an existing portfolio
directory by name, and the repository refuses to replace different bytes at the same portfolio ID.
Do not edit generated HTML directly; change the renderer and its contract together, then run the
checks.

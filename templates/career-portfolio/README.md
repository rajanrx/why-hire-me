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

For an existing local prototype, the person's approved HTML/CSS/interaction shell is the baseline.
Keep its four Experience, Expertise, Graph, and Evidence lenses while adding reviewed career data.
The portal skill checks visual and interaction assets against that baseline. A frontend skill can
refine details within the shell; it cannot supply a different page system. New prototypes need the
canonical renderer or another approved reusable shell. Otherwise, stop instead of improvising a
new design.

Every drawer readout belongs to the selected entity. An Organisation entry should explain the
organisation, period, roles, and linked work—not repeat a nine-year résumé sentence beside every
Lightspeed item. Work and Technology entries describe their own problem, contribution, and use.
If the input lacks specific context, show linked records and state that the detail is missing.
Keep evidence locators in the Evidence lens. Treat data freshness, query speed, phone-visible
speed, and business impact as separate measures with their own attribution.

The selected-record detail box is a desktop side panel and a mobile bottom drawer. It opens on
selection, shows the chosen title and summary immediately, and has internal scrolling, Close,
Escape, focus return, and reduced-motion behaviour. The separate entity explorer keeps its side
drawer and Back path on both layouts. A bottom-of-page inline detail box is not conformant.

Keep a visible “Made with Why Hire Me” attribution linking to the project’s GitHub repository.
The Experience lens orders achievements by approved priority and previews at most three featured
records per role. Supporting, summarised, and overflow records stay in a named disclosure and in
print; expansion changes presentation, not career knowledge.
The Graph lens starts with every authorised node and relationship visible. Use a searchable
multi-focus picker to highlight several explicit neighbourhoods without deleting the rest of the
graph. Clicking a node changes its contextual readout without clearing focus selections or the
gray-out state. Connection count can enlarge circles on a relative logarithmic scale, capped at
1.65× their normal radius so hubs remain legible but balanced. Pan, zoom, fit/reset, and full-screen
controls must keep the selected-node context box in
view; on mobile that box remains an on-demand bottom drawer.
Show Contact in top navigation only if an approved contact destination works. An approved LinkedIn
profile may use the bundled `linkedin.svg` icon in an `<a aria-label="LinkedIn">` link; give the
decorative icon an empty `alt` when rendered with `<img>`. Do not publish a profile URL
or other personal contact details merely because they appeared in a source file.

# why-hire-me

## 0.12.0

### Minor Changes

- 69bc7a9: Let the evidence-led interviewer ask whether the person wants a deep dive or general questions
  before knowledge discovery, and offer each discovery question as non-leading answer options with a
  free-text answer. Formal evaluation keeps open, identical core questions.
  After each answer, the interviewer reconciles it with existing evidence as aligned, new, or
  conflicting, asks the person to resolve conflicts without overwriting either side, and offers
  recall aids from their own evidence to help them answer accurately.
- cb36481: Add the opt-in `material-profile` portfolio template: an evaluator-first Material 3 profile with
  Overview, Career, Skills, and question-led Explore with a focused graph, light and dark themes, and
  optional approved AI-notebook and audio-overview disclosures. `editorial-record` stays the
  byte-identical default; choose a family with `--template`.
- 6769cb9: Polish the material-profile template: LogicBook-style Material 3 tokens with embedded Roboto Flex,
  Lucide icons, company logos from approved assets, brand-coloured technology badges with company
  hover cards, a reading-focused record sheet, and a focused graph that expands in place as a radial
  tree with logos, matte kind colours and a full-screen mode.
- 69bc7a9: Make the reviewed-packet portfolio workflow reproducible for anyone: approved interview answers apply
  through an idempotent `packet-amendments` file (`amend-reviewed-packet.mjs`) that also keeps renamed
  records in step across derived text; `approve-candidate.mjs` applies an approved candidate with
  relative paths; `print-resume.mjs` renders a print-ready résumé from the portfolio's reviewed data and
  prints it with a local Chrome; `verify-hosted.mjs` checks a hosted copy byte-for-byte. The preview
  builds a first portfolio without a baseline, resolves assets relative to the packet, and treats a
  re-run of the same build as unchanged; the NotebookLM handoff is likewise re-runnable. A fictional
  sample packet and a CI test run the whole sequence twice and pin its digest. The README opens with a
  three-skill getting-started path and copyable prompts.

### Patch Changes

- 3c2f788: Keep the material-profile focused graph readable: cap zoom for small neighbourhoods and open the graph
  in place of the Explore lists so it appears first on phones.

## 0.11.0

### Minor Changes

- 1b7a55a: Make the complete disclosure-safe `portfolio.json` the primary NotebookLM career source and package
  a deterministic handoff builder with a byte-identical text fallback and approved-reference index.

## 0.10.2

### Patch Changes

- f123737: Reserve the public portfolio header for approved LinkedIn and résumé actions, and move release or prototype provenance identity into the Evidence lens.

## 0.10.1

### Patch Changes

- 9bcf47f: Harden reviewed prototype disclosure scanning, carry-forward target resolution, governed portable data, and local-preview QR privacy.
- 9bcf47f: Add a disclosure-safe AI handoff with an offline QR link to the canonical portfolio JSON. Make
  multi-record graph focus display and frame the union of every selected record's reviewed
  relationships, and keep the graph canvas contained within the shared portfolio shell.
- 9bcf47f: Harden reviewed prototype privacy, mapping, relationship, and carry-forward validation. Improve the
  canonical Cytoscape graph with true circular nodes, entity-specific colours, logarithmic hub sizing,
  explicit category hubs, automatic selected-neighbour framing, a readable reset overview, and a
  wider responsive workspace.

## 0.10.0

### Minor Changes

- 44b4c73: Make `output-career-portfolio` the official gateway for governed releases and reviewed local prototypes through one canonical display model and renderer. Package a truthful prototype adapter, Cytoscape-powered offline graph exploration, preservation validation, dense fictional graph testing, and local side-by-side preview commands.

## 0.9.4

### Patch Changes

- e236e74: Allow a reviewed local prototype to produce a non-replacing, canonical-template candidate preview without fabricating a validated release. Keep approval separate for main-portfolio replacement, report pending visual changes during preview, and preserve approved links, PDF content, privacy choices, and carry-forward knowledge across agents and computers.

## 0.9.3

### Patch Changes

- d0898b6: Keep portfolio updates on the approved template, require entity-specific initiative context, and replace the focus-only graph with a complete default view, searchable multi-focus, pan/zoom, and full-screen exploration that retains the selected-node readout and never clears focus on node selection. Bound connection-weighted node size so hubs are distinct but balanced. Prioritise Experience achievements with expandable supporting/overflow records while preserving all approved information and print content. Move selected graph details into a mobile bottom drawer, add visible Why Hire Me attribution, and omit dead Contact navigation. Provide a consent-gated local LinkedIn icon and a template conformance check for existing portfolios.

## 0.9.2

### Patch Changes

- 8aaf115: Make output-career-portfolio the sole local portfolio-update gateway. Preserve existing approved
  knowledge, contextual technology use, and résumé links through explicit coverage and carry-forward
  maps; route new evidence from input and interview skills through review. Add optional, visitor-
  initiated video playback guidance and cache-aware Firebase verification.
  Add an optional four-hour cached skill-version check with consent-gated installer updates.

## 0.9.1

### Patch Changes

- 0560abc: Make featured career evidence nearly neutral and widen the desktop drill-down navigator for more comfortable reading.

## 0.9.0

### Minor Changes

- bfd4565: Add a compact, light, multi-lens career portfolio with explicit entity exploration, focused graph
  navigation, reviewed technology categories, configurable résumé length, a canonical sample
  generator, and semantic highlighting for approved key achievements. Adopt PolyForm Strict licensing
  with separate commercial terms and privacy-preserving public build discovery.

## 0.8.1

### Patch Changes

- 9b70935: Describe the accountable, light-first career record experience accurately in the public README.

## 0.8.0

### Minor Changes

- 6ede566: Require complete résumé source-unit coverage and accountable portfolio inclusion decisions, then
  render a professional light-first offline career explorer with searchable records, selectable graph
  nodes, explicit relationships, and a printable résumé.

## 0.7.1

### Patch Changes

- 8a6a2f6: Fix isolated Firebase Hosting publication by selecting an explicit existing site ID instead of a
  deploy target whose mapping is unavailable without the user's local Firebase project file.

## 0.7.0

### Minor Changes

- 324449e: Add the stable local path from an expiring authorised view through a validated portable release to a
  deterministic offline portfolio, plus an idempotent Firebase Hosting reference adapter.

## 0.6.0

### Minor Changes

- 44c9b66: Add `why-hire-me:input-career-reference-explorer` for bounded exploration of portfolios,
  publications, credentials, and other links with explicit identity and verification state.
- 08f02f9: Add `why-hire-me:async-interview` for structured, accessible asynchronous evaluation with declared
  criteria and accountable human outcomes.
- 91eef0c: Add a truthful public-static Firebase Hosting publisher beneath the career publisher.
- ad8fcf9: Add the governed GitHub release destination skill beneath the career publisher.
- 1fe0a77: Add `why-hire-me:job-application-tailor` for evidence-traceable opportunity analysis, truthful résumé
  and cover-letter drafting, and explicit gap evaluation.
- 62c1228: Add `why-hire-me:knowledge-curator` for bounded, evidence-aware semantic review with explicit human
  admission authority.
- 636e10d: Add capability-aware NotebookLM synchronisation as a destination leaf.
- e4ebce4: Add `why-hire-me:output-career-portfolio` for validated preview and local-first generation of an
  accessible, evidence-backed static career portfolio.
- 65d5322: Add `why-hire-me:output-career-publisher` and formalise a scalable parent, destination-skill, and
  connector publication tree.
- cf702fc: Add `why-hire-me:output-career-knowledge-guide` for evidence-linked Q&A within one authorised,
  versioned career knowledge view or portable release.

## 0.5.0

### Minor Changes

- e15a3e2: Add `why-hire-me:input-work-evidence-explorer` for safe, bounded, profession-neutral exploration of
  work samples with explicit attribution and evidence-linked proposals.

### Patch Changes

- 1d4a6ec: Add scalable, skill-specific examples for conversational prompts, expected outputs, the planned job
  application workflow, and the governed development CLI.

## 0.4.0

### Minor Changes

- 84a8a5d: Add `why-hire-me:input-resume-explorer` for provenance-aware résumé exploration, typed career
  knowledge proposals, and focused follow-up questions.

## 0.3.3

### Patch Changes

- 0c86002: Mark upcoming directional skills with `input-` and `output-` prefixes while keeping cross-cutting
  workflow, governance, and evaluation skills named for their business purpose.

## 0.3.2

### Patch Changes

- 5f86164: Show the complete upcoming AI skill ecosystem in the README, covering career sources, semantic
  curation, evidence-backed questions, asynchronous interviews, portfolios, and output publishing.

## 0.3.1

### Patch Changes

- f85e414: Refocus the README on a concise three-step AI journey, move the development CLI into its own guide,
  and document the planned offline career portfolio and optional platform-independent hosting output.

## 0.3.0

### Minor Changes

- a6dd57f: Add governed accept, reject, and defer decisions for staged entity proposals. Accepted proposals
  now create canonical entities with admission provenance, while unresolved ambiguity fails closed.
  
  Clarify `why-hire-me:<skill>` plugin namespacing and verify release archives exclude development
  intent, specifications, source files, tests, and CI material.

## 0.2.0

### Minor Changes

- 96f7b0d: Add one-command AI skill installation, automatic validation, and versioned GitHub release bundles
  with release notes and checksums. Refresh public language around a warm, evidence-backed career
  profile, and adopt AGPL-3.0-or-later with separate trademark protection.

## 0.1.0

Initial private, evidence-backed career profile foundation.

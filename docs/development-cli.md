# Development CLI

The local knowledge runtime is a developer preview. It demonstrates the governed path from a
selected source to reviewed canonical knowledge. It is not yet the end-user installer.

## Set up the repository

You need Node.js 22 or newer and pnpm 10.

```sh
git clone https://github.com/rajanrx/why-hire-me.git
cd why-hire-me
pnpm install
pnpm run check
```

The CLI stores private data in `~/.why-hire-me` by default. Set `WHY_HIRE_ME_HOME`, or pass
`--database <path>`, to use another location. Commands return structured JSON so scripts and future
AI tools can use the same application boundary.

## Create a profile

The command returns JSON containing `profile.id`.

```sh
pnpm run cli profile create --name "Your Name"
```

## Capture a selected file

Copy the profile ID from the previous result. The command returns `capture.id` and an immutable
snapshot digest.

```sh
pnpm run cli source ingest \
  --profile "<profile-id>" \
  --file "<resume-or-work-file>"
```

Only the selected regular file is read. Directory traversal, PDF, DOCX, OCR, and automatic source
discovery are outside this development slice.

## Extract citable text

Copy the capture ID from the capture result. The command returns `extraction.artifact.id`, its
snapshot lineage, and its line count. The current extractor supports UTF-8 `.txt`, `.md`, and
`.markdown` files.

```sh
pnpm run cli evidence extract-text \
  --profile "<profile-id>" \
  --capture "<capture-id>"
```

## Stage an entity proposal

Copy the text artefact ID from the extraction result and choose a one-based inclusive line range.

```sh
pnpm run cli knowledge stage-entity \
  --profile "<profile-id>" \
  --type Organisation \
  --name "Example organisation" \
  --artifact "<text-artifact-id>" \
  --lines 1:2 \
  --generator-type human \
  --generator local-user \
  --generator-version 1 \
  --uncertainty low \
  --uncertainty-rationale "Named explicitly in the selected evidence" \
  --review person-required \
  --policy private \
  --actor local-user \
  --correlation-id "<your-trace-id>"
```

Supported entity types are `Person`, `Organisation`, `Engagement`, `Role`, `Work`, `Contribution`,
`Artefact`, `Technology`, `TechnologyUse`, and `Credential`. A staged proposal is not canonical
knowledge.

## Review the proposal

Copy the candidate ID returned by the staging command. Acceptance creates the canonical entity;
rejection and deferral leave canonical knowledge unchanged.

```sh
pnpm run cli knowledge review-entity \
  --profile "<profile-id>" \
  --candidate "<candidate-id>" \
  --decision accepted \
  --reason "I confirmed this from my selected evidence" \
  --reviewer local-user \
  --reviewer-authority person \
  --correlation-id "<your-trace-id>" \
  --idempotency-key "<stable-retry-key>"
```

If the candidate reports possible duplicates or conflicts, acceptance also requires
`--duplicates distinct` or `--conflicts resolved`, plus `--resolution-reason`. Deferring preserves
the review trail and allows a later decision. Acceptance and rejection are terminal.

## Validate a change

```sh
pnpm run check
pnpm run spec:validate
```

Durable behaviour starts as an intent-linked OpenSpec change and receives one quick review. Add a
changeset for a releasable change:

```sh
pnpm changeset
```

> [!important] Before opening a change
> - [ ] Read the [architecture](../intent/specs/architecture.md) and [first-release RFC](../intent/specs/rfc/RFC-001-first-knowledge-release.md).
> - [ ] Keep domain ports inward-facing and adapters replaceable.
> - [ ] Run the complete check and add a changeset when users will notice the change.

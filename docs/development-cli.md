# Development CLI

The local reference runtime demonstrates the governed path from a selected source to reviewed
canonical knowledge, an authorised release, and an offline portfolio. It remains a developer CLI,
not the one-command AI-skill installer.

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

## Create an authorised view

Choose the exact purpose, audience, policy labels, and expiry. `--confirm` records the person's
approval of that disclosure boundary. The returned JSON contains `view.id` and excluded-record counts.

```sh
pnpm run cli knowledge create-view \
  --profile "<profile-id>" \
  --purpose "offline career portfolio" \
  --audience private \
  --audience-description "local review by me" \
  --allow-policy shareable \
  --expires-at "2027-01-01T00:00:00Z" \
  --reviewer local-user \
  --idempotency-key "<stable-view-key>" \
  --confirm
```

The current reference runtime includes accepted entities and their admission activities. Claim,
evidence, and alias admission is not implemented yet, so every view and release states that limitation.

## Create and validate a portable release

Publication reads the immutable view rather than canonical storage. It writes a content-addressed
directory under `~/.why-hire-me/releases` and returns its path.

```sh
pnpm run cli release create \
  --profile "<profile-id>" \
  --view "<view-id>"

pnpm run cli release validate \
  --path "<release-directory>"
```

Validation uses only the release directory. It checks the schema, safe paths, digests, byte sizes,
record counts, NDJSON families, knowledge-space identity, and admission-activity references.

## Build the offline portfolio

Create an inclusion-map JSON array with one decision for every authorised Work, Contribution, and
reported outcome. Preview the complete decision map before confirming generation.

```sh
pnpm run cli portfolio preview \
  --release "<release-directory>" \
  --inclusion-map "./inclusion-map.json"

pnpm run cli portfolio build \
  --release "<release-directory>" \
  --inclusion-map "./inclusion-map.json" \
  --confirm
```

Open the returned `index.html`. The renderer escapes career content and includes local styling, a
Content Security Policy, searchable record navigation, an interactive graph with an equivalent
relationship index, responsive layout, and print CSS. The light theme is the default. Rebuilding the same release with the same renderer reuses the same projection. New
generation stops after the authorised view expires; an already generated local file is not deleted.

## Optional Firebase Hosting reference adapter

This action is public. Install and authenticate the Firebase CLI separately, set
`GOOGLE_APPLICATION_CREDENTIALS` to an authorised service-account file, and use an existing project
and Hosting site ID. The command stages only the validated portfolio files and writes an isolated
single-site Firebase configuration; it does not depend on or copy a local `.firebaserc`.

```sh
pnpm run cli portfolio publish-firebase \
  --portfolio "<portfolio-directory>" \
  --project "<firebase-project-id>" \
  --site "<firebase-hosting-site-id>" \
  --mode preview-channel \
  --channel career-v1 \
  --expires 7d \
  --idempotency-key "firebase-career-v1" \
  --confirm-public
```

Preview-channel and live Hosting URLs are both public. Live deployment uses `--mode live` and requires
a new `--confirm-public`. Missing credentials, invalid portfolio bytes, ambiguous targets, and CLI
failure stop without changing the local release or portfolio. Publication also stops when the
portfolio's disclosure authorisation has expired.

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

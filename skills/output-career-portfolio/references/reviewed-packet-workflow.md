# Reviewed-packet workflow

Every step is a command over files the person has reviewed. Given the same files, any machine
produces the same portfolio bytes, and re-running a step that already ran reports `unchanged`.
The paths below are relative to the why-hire-me package.

A complete fictional example lives in [`../assets/sample-packet/`](../assets/sample-packet/), and
`src/portfolio-reproducibility.test.ts` runs this whole sequence twice in CI.

## 0. Get the commands

Skill installers copy only the skills. The commands below need the package. Install it as a
dependency of the person's own private career repository from a release tarball
(`https://github.com/rajanrx/why-hire-me/releases/download/v<version>/why-hire-me-v<version>.tar.gz`),
then run them as `node node_modules/why-hire-me/scripts/portfolio/<command>.mjs` or as package
scripts; the project README shows a complete `package.json`. Paths below are relative to the
package root. To work on Why Hire Me itself, clone it and run `pnpm install && pnpm run build` instead.

## Write the first packet

`output-career-portfolio` writes version 1 of the packet from the person's reviewed proposals
(résumé, work evidence, references, interview answers); later versions come only from amendments.
Start from [`../assets/sample-packet/reviewed-packet-v1.json`](../assets/sample-packet/reviewed-packet-v1.json)
and keep its shape. The preview command is the validator: it refuses anything below.

- **Envelope:** `schema` `why-hire-me.reviewed-prototype-packet/v1`, a `packetId`, `subjectDisplayName`,
  `purpose`, `audience` (`private`, `restricted`, or `public`), `resumeLength` (`one-page`, `two-pages`,
  `three-pages`, `complete`), and `review` with who reviewed, when, and one disclosure choice per
  personal field (`approved-for-audience` or `omitted`).
- **Items:** `id`, `type`, `name`, `summary` (or `null`), `recordedAt`, `details` (label/value pairs such
  as `Period`, `Location`, `Evidence`), and `inclusion`. Types: `Person`, `Organisation`, `Engagement`,
  `Role`, `Work`, `Contribution`, `Reported outcome`, `Technology`, `TechnologyCategory`,
  `TechnologyUse`, `Credential`.
- **Relations:** each one explicit, reviewed, and unique. Use the sample's predicates:
  `person.has_engagement`, `engagement.with_organisation`, `engagement.has_role`,
  `engagement.includes_record`, `record.summarised_under`, `record.has_contextual_technology`,
  `technology_use.in_context`, `technology.belongs_to_category`. Never infer an edge from shared words.
- **Inclusion:** every Work, Contribution, and Reported outcome has exactly one decision (`featured`,
  `supporting`, `summarised` with the record it sits under, `excluded`, or `deferred`) in both the item
  and `inclusionDecisions`.
- **Maps:** `technologyUseMap` covers every TechnologyUse; `referenceLinkMap` covers every link;
  `carryForwardMap` is empty for a first build.
- **Links:** `sourceStatus` is `supplied-unvisited` or `separately-reviewed`; an AI notebook link uses
  `role: "ai-notebook"` and needs an approved `AI notebook` disclosure.
- **Assets:** `sourcePath` relative to the packet; `.pdf` becomes the résumé, `.mp3`/`.m4a` an audio
  overview (needs an approved `Audio overview` disclosure), and a logo names its `targetRecordId`.

## 1. Build the first portfolio

The input skills and curator produce a reviewed packet (`why-hire-me.reviewed-prototype-packet/v1`):
records, explicit reviewed relations, approved links, an inclusion decision for every Work,
Contribution, and reported outcome, technology-use and link maps, disclosure choices, and assets
whose `sourcePath` is relative to the packet file.

```sh
node scripts/portfolio/preview-reviewed-prototype.mjs --packet career/reviewed-packet-v1.json \
  --output candidate-v1 --template material-profile
```

Review the candidate in a browser, then apply the person's approval. The published directory holds
only servable files; the generation record is written beside it with relative paths.

```sh
node scripts/portfolio/approve-candidate.mjs --candidate candidate-v1 --target career/public \
  --approved-by "<person> approved on <date>"
```

## 2. Add interview answers

After an `evidence-led-interviewer` session, the person's approved answers become an amendments
file. Each field states the desired end value, so applying it twice changes nothing.

```json
{
  "schema": "why-hire-me.packet-amendments/v1",
  "packetId": "<next packet id>",
  "reviewedBy": "<person> approved the discovery answers",
  "reviewedAt": "2026-10-15T00:00:00.000Z",
  "evidence": "<person>'s discovery interview · 2026-10-15",
  "updates": [{ "id": "<record id>", "name": "<new name>", "summary": "<approved wording>",
    "details": { "Period": "<value>" },
    "inclusion": { "status": "featured", "rationale": "<why>", "summarisedUnderRecordId": null } }],
  "additions": [{ "item": { "id": "<new id>", "type": "Reported outcome", "name": "<name>", "summary": "<text>" },
    "engagementId": "<engagement id>", "parentId": "<work id>",
    "inclusion": { "status": "summarised", "rationale": "<why>", "summarisedUnderRecordId": "<work id>" } }],
  "assets": [{ "sourcePath": "resume.pdf", "outputPath": "resume.pdf", "reviewed": true, "reviewReference": "<review>" }],
  "limitations": ["Interview figures are person-stated and approximate."]
}
```

```sh
node scripts/portfolio/amend-reviewed-packet.mjs --packet career/reviewed-packet-v1.json \
  --amendments career/amendments-v2.json --output career/reviewed-packet-v2.json
node scripts/portfolio/preview-reviewed-prototype.mjs --packet career/reviewed-packet-v2.json \
  --baseline career --output candidate-v2 --template material-profile
```

A renamed record's old name is replaced in every other record's text, so organisation and
technology readouts never keep stale names. Updated records gain the evidence label once, and their
carry-forward entry becomes `reworded`. Unknown record IDs are refused rather than guessed.

## 3. Print the résumé

The résumé is rendered from the portfolio's own reviewed display model at the packet's
`resumeLength`, then printed by a local Chrome or Chromium (`--browser` or `CHROME_PATH`).

```sh
node scripts/portfolio/print-resume.mjs --portfolio candidate-v2 --output career/resume.pdf
```

Add the PDF to the next amendments file as an asset with kind inferred from `.pdf`, rebuild, and
approve. Use `--output resume.html` to print it yourself when no browser is available.

## 4. Share

- **Hosting:** deploy the published directory with the destination's own tool (for Firebase,
  `firebase deploy --only hosting`), then verify every file byte-for-byte and keep that evidence beside the destination skill's own
  publication record:
  `node scripts/portfolio/verify-hosted.mjs --portfolio career/public --url https://<site> --output career/hosted-verification.json`
- **NotebookLM:** consumer NotebookLM has no supported upload API, so prepare a manual handoff with
  the sync skill's script, named after the portfolio digest so each version gets its own folder:
  `node skills/output-notebooklm-sync/scripts/prepare-handoff.mjs --portfolio career/public/portfolio.json --output career/notebooklm-handoff/<digest-prefix>`
  Upload `portfolio.json` (or the `.txt` fallback, never both), wait for processing, then remove the
  previous handoff's sources so the notebook does not answer from out-of-date facts.

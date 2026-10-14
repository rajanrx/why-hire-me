# Reviewed-packet workflow

Every step is a command over files the person has reviewed. Given the same files, any machine
produces the same portfolio bytes, and re-running a step that already ran reports `unchanged`.
Run the commands from the why-hire-me package (a clone or the release bundle after
`pnpm install && pnpm run build`); the paths below are relative to it.

A complete fictional example lives in [`../assets/sample-packet/`](../assets/sample-packet/), and
`src/portfolio-reproducibility.test.ts` runs this whole sequence twice in CI.

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
  `firebase deploy --only hosting`), then verify every file byte-for-byte and keep the record:
  `node scripts/portfolio/verify-hosted.mjs --portfolio career/public --url https://<site> --output career/publication-record.json`
- **NotebookLM:** consumer NotebookLM has no supported upload API, so prepare a manual handoff with
  the sync skill's script, named after the portfolio digest so each version gets its own folder:
  `node skills/output-notebooklm-sync/scripts/prepare-handoff.mjs --portfolio career/public/portfolio.json --output career/notebooklm-handoff/<digest-prefix>`
  Upload `portfolio.json` (or the `.txt` fallback, never both), wait for processing, then remove the
  previous handoff's sources so the notebook does not answer from out-of-date facts.

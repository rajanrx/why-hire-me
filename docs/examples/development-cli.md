# Development CLI example

This is a representative governed path through the local developer runtime. The exact IDs, digests,
paths, and timestamps will differ.

## 1. Create a profile

```sh
pnpm run cli profile create --name "Ada Example"
```

```json
{
  "kind": "profile-created",
  "profile": {
    "id": "generated-profile-id",
    "displayName": "Ada Example"
  },
  "databasePath": "/home/ada/.why-hire-me/knowledge.db"
}
```

## 2. Capture one selected text file

```sh
pnpm run cli source ingest \
  --profile "generated-profile-id" \
  --file "/home/ada/career/resume.md"
```

```json
{
  "kind": "source-captured",
  "capture": {
    "id": "generated-capture-id",
    "outcome": "completed",
    "requestedLocator": "/home/ada/career/resume.md",
    "snapshot": {
      "digest": "64-character-sha256-digest"
    }
  }
}
```

Only the selected regular file is read. The current extractor supports UTF-8 `.txt`, `.md`, and
`.markdown`; PDF, DOCX, OCR, and directory traversal are not yet supported by this CLI slice.

## 3. Extract citable text

```sh
pnpm run cli evidence extract-text \
  --profile "generated-profile-id" \
  --capture "generated-capture-id"
```

```json
{
  "kind": "text-extracted",
  "extraction": {
    "outcome": "completed",
    "artifact": {
      "id": "generated-text-artifact-id",
      "lineCount": 24
    }
  }
}
```

## 4. Stage, then review

Use the returned artefact ID and precise line range with `knowledge stage-entity`. The result is an
`entity-candidate-staged` record, not canonical knowledge. Use `knowledge review-entity` to accept,
reject, or defer it; only an accepted review can create a canonical entity.

See the [development CLI reference](../development-cli.md) for the complete commands and required
governance options.

## 5. Freeze an authorised view

```sh
pnpm run cli knowledge create-view \
  --profile "generated-profile-id" \
  --purpose "offline career portfolio" \
  --audience private \
  --audience-description "local review" \
  --allow-policy shareable \
  --expires-at "2027-01-01T00:00:00Z" \
  --reviewer local-user \
  --idempotency-key "portfolio-view-v1" \
  --confirm
```

## 6. Create and validate the release

```sh
pnpm run cli release create \
  --profile "generated-profile-id" \
  --view "generated-view-id"

pnpm run cli release validate \
  --path "/home/ada/.why-hire-me/releases/generated-release-id"
```

## 7. Build the offline portfolio

```sh
pnpm run cli portfolio build \
  --release "/home/ada/.why-hire-me/releases/generated-release-id"
```

The result contains a deterministic portfolio ID, projection digest, manifest, and local directory.
Opening `index.html` needs no account or network connection.

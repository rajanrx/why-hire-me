# Stability boundary

Why Hire Me has a stable local reference path and an evolving product surface. “Stable” means the
implemented path is deterministic, fail-closed, tested, and honest about unsupported behaviour. It
does not mean every planned input, semantic record, AI host, or publication destination is implemented.

## Supported reference path

The TypeScript CLI on Node.js 22 can:

1. create one local person profile;
2. capture one explicitly selected regular file;
3. extract citable UTF-8 text from `.txt`, `.md`, or `.markdown`;
4. stage and human-review a typed entity proposal;
5. freeze accepted entities and their admission activities into an expiring, policy-filtered view;
6. create and independently validate an immutable NDJSON knowledge release;
7. render that release into deterministic, accessible offline HTML; and
8. publish the exact portfolio through an existing Firebase Hosting target after explicit public
   confirmation, when the Firebase CLI and service-account credentials are supplied.

The AI plugin contains fourteen installable conversational skills. GitHub and NotebookLM destination
skills define governed workflows and fail closed when a compatible connector is unavailable. They do
not imply that vendor API adapters ship in the local runtime.

## Explicit limits

- The canonical runtime admits entities. Claim, evidence, alias, correction, revocation, and identity
  merge workflows remain future capabilities. Releases contain empty files for unsupported record
  families and state this limitation in their manifest.
- The file connector does not yet parse PDF or DOCX, crawl directories, inspect repositories, run OCR,
  or discover files automatically.
- The reference SQLite runtime is local and single-person. Hosted multi-user editing, encryption,
  backup, migration, and concurrent writers are not production guarantees.
- The offline graph currently presents admitted entities. Relationship edges require admitted claims.
- Expiry prevents new portfolio generation or publication. It cannot delete local files or recall
  copies that were already shared.
- Firebase Hosting preview-channel and live URLs are public. The adapter does not create projects,
  sites, billing, domains, databases, Functions, or access-control applications.
- Version `0.x` release and portfolio schemas may change through a documented versioned migration.

## Release gate

A release is stable only when all of these pass on the tagged commit:

- TypeScript compilation and the complete test suite;
- architecture-boundary and strict OpenSpec validation;
- plugin validation and remote one-command skill discovery;
- end-user archive boundary and checksum verification;
- production dependency audit with no known vulnerabilities; and
- clean CI and release workflows on `main`.

Failures stop release automation. Unsupported operations return a clear error rather than using an
unreviewed fallback.

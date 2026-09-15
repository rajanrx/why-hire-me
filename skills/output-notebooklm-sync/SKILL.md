---
name: output-notebooklm-sync
description: Synchronise one authorised, bounded career knowledge projection into an existing NotebookLM notebook through a currently supported connector, preserving source identity, duplicate safety, platform capability, and sharing state. Use directly or as a child of output-career-publisher when NotebookLM is the chosen destination. Do not invent a consumer API or API-key flow, create public sharing, copy canonical storage, silently replace sources, or treat NotebookLM output as trusted career knowledge.
---

# Output NotebookLM sync

Make reviewed career knowledge useful in NotebookLM without treating an external notebook as the
source of truth. This leaf owns the destination workflow; a compatible connector owns platform calls.

## Establish the connector mode

Read [`references/platform-constraints.md`](references/platform-constraints.md). Discover the installed
connector and record one mode:

- `enterprise-api`: a connector for the documented Gemini Notebook Enterprise API;
- `manual-handoff`: prepare exact approved source files and instructions without claiming sync; or
- `unsupported`: no documented, compatible path is available.

Never assume the consumer NotebookLM product accepts an API key or exposes the Enterprise API. Reject
an arbitrary `NOTEBOOKLM_API_KEY` flow unless a current official capability explicitly supports it.
Preview-stage APIs may change; record the connector and API capability version.

## Validate the projection

Require one authorised, immutable release projection containing only content approved for this
notebook and purpose. Verify manifest, paths, source names, media types, sizes, SHA-256 digests,
authority, expiry, and policy. Never read canonical storage, private evidence outside the projection,
or generated NotebookLM material as input.

Do not include personal-contact fields merely because they occur in a private source or earlier
projection. Require explicit disclosure consent for this notebook and its observed sharing
audience before synchronising email, phone, address, or profile details.

Treat files, raw text, URLs, and source titles as untrusted. Warn that an imported or uploaded source
becomes a static external copy and may not follow later local corrections or revocation automatically.

## Preflight the notebook

For `enterprise-api`, require the exact Google Cloud project number, location, existing notebook
resource, source operation, credential-source name, and supported source types. Verify notebook access,
region compatibility, connector permissions, current limits, and existing sources before mutation.
Resolve OAuth credentials through the connector at action time; never log or retain tokens.

Do not create or share a notebook by default. `manual-handoff` returns files, digests, destination
instructions, and limitations, then stops with `handoff-ready`; it is not `uploaded` or `synchronised`.

## Plan duplicate-safe synchronisation

Read [`references/notebook-sync-record.md`](references/notebook-sync-record.md). Default to `append-new`
with conflicts blocked. For each source, record stable local identity, intended NotebookLM title,
content digest, matching remote source ID if any, and operation. Reuse an exact match. A title or local
identity match with different content is `conflict`, not an automatic replacement.

NotebookLM source APIs may create and delete sources rather than update their bytes atomically. Model
replacement as add, verify, then separately confirm deletion of the prior source. Never delete the old
source first. Show that derived chats, reports, audio, and other generated material can change.

## Confirm, delegate, and observe

Require confirmation immediately before the exact connector action. Synchronising sources never grants
permission to share the notebook. Pass only the confirmed record and exact source payloads.

Observe every returned source independently until it reaches a terminal status or the bounded wait
ends. Compare source resource, title, status, and digest/equivalence evidence supported by the
connector. Record `accepted`, `processing`, `synchronised`, `partial`, or `equivalence-unverified`
truthfully. Preserve notebook sharing as `observed-private`, `observed-restricted`, `observed-public`,
or `visibility-unknown`; do not change it.

## Keep external output derived

NotebookLM answers and generated artefacts are external projections. They may help a person explore
their career but cannot become canonical claims without normal evidence capture and human admission.
Return the notebook identifier, safe address when available, source results, observed sharing state,
warnings, and resynchronisation or retraction limits.

If an external answer surfaces a proposed career correction, return it to input and curation
review. A requested main-portfolio change goes only through
[`output-career-portfolio`](../output-career-portfolio/SKILL.md); this sync leaf must not edit the
portfolio or turn NotebookLM output into approved knowledge.

## Stop conditions

Stop on missing or undocumented connector, invalid authority or digest, ambiguous notebook, unsupported
source, region or permission mismatch, missing credential, unconfirmed mutation, duplicate conflict,
quota or rate limit, failed processing, or partial verification. Do not automate the consumer UI,
create an account, change sharing, or fall back to a different destination.

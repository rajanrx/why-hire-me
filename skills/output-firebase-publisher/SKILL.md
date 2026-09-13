---
name: output-firebase-publisher
description: Publish one authorised, self-contained static career portfolio through an existing Firebase Hosting site, with local-first preview, explicit public-visibility warnings, site isolation, exact-file verification, and separate confirmation for preview-channel or live delivery. Use directly or as a child of output-career-publisher when Firebase Hosting is the chosen destination. Do not use for private or restricted sharing, project or site creation, application backends, databases, analytics, domains, billing, or silent live deployment.
---

# Output Firebase publisher

Publish a reviewed static portfolio without making Firebase part of the career knowledge core. This
leaf coordinates one Hosting destination; a connector owns Firebase CLI or API translation.

## Accept only a completed static projection

Require an authorised portfolio manifest and a self-contained static directory. Verify release and
projection IDs, authority, expiry, file paths, media types, sizes, SHA-256 digests, entry point,
internal links, and policy. Reject symlinks that escape the root, secret files, source maps, local data,
credentials, development files, remote scripts, analytics, or undeclared network dependencies.

Never read canonical knowledge, rebuild the portfolio, inject Firebase SDK code, or add claims. Read
[`references/firebase-publication-record.md`](references/firebase-publication-record.md) and
[`references/platform-constraints.md`](references/platform-constraints.md).

## State the visibility boundary first

Firebase Hosting serves deployed static content publicly. Preview-channel URLs are temporary and hard
to guess, but they are also public. This leaf supports `requestedVisibility: public` only. If private
or restricted access is requested, stop as `unsupported-visibility`; do not use obscurity as access
control. A separately designed authenticated application or gateway is a different projection and
connector capability, not a flag on this static publisher.

Warn that public files can be downloaded, cached, indexed, archived, or redistributed and may survive
rollback or deletion elsewhere.

## Preflight an existing Hosting site

Require an explicit Firebase project ID, existing Hosting site ID, channel mode,
credential-source name, and connector capability version. Verify project access, selected site,
current live or channel release, quotas, configuration, and exact public root. Resolve credentials
through the connector only at action time; never display or persist values.

Do not create projects or sites, enable products, change billing, configure custom domains, deploy
Functions, modify databases or security rules, add analytics, or alter unrelated Hosting sites.

## Preview in two safe stages

First produce a local preview from the exact directory and manifest; local preview is not publication.
Then offer one remote operation:

- `preview-channel`: a temporary public URL with an explicit expiry; or
- `live`: the site's durable public channels.

Default to local-only. Show exact files and digests, project/site/channel, public visibility, expiry,
conflict policy, credential-source name, existing remote state, and retraction limits. Use a stable
idempotency key from project, site, channel, projection digest, and manifest digest. A remote version
with proven equivalent content is a match; a mismatch is `conflict` unless an exact replacement was
separately planned.

## Confirm and delegate narrowly

Require action-time confirmation for the exact public destination. Approval for a temporary preview
channel does not approve a live deploy; live always requires a new preview and confirmation. Pass only
the confirmed manifest and static root to a connector restricted to that Hosting site.

## Observe the deployed result

After acceptance, retrieve the release/version state and safe Hosting URL. When supported, fetch the
entry point and declared assets through their public URLs and compare bytes or digests. Report
`accepted`, `deployed`, `partially-verified`, and `observed-public` separately. A successful CLI exit or
returned URL alone is not proof that every expected file is reachable.

Return project, site, channel, version or release ID, safe URL, expiry, verification results, warnings,
and rollback/retraction instructions. Rollback creates another release; it cannot recall downloaded or
cached copies.

## Stop conditions

Stop on invalid authority or manifest, unsafe files, unsupported visibility, ambiguous or missing
site, insufficient permission, missing connector or credential, unconfirmed public action, remote
conflict, quota or rate limit, partial deployment, or failed observation. Never fall back to another
site or broaden the operation.

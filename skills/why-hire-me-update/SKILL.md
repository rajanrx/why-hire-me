---
name: why-hire-me-update
description: Check whether a newer why-hire-me skill release is available, with a four-hour local cache, and update the installed skills only after the user agrees. Use for version checks or skill upgrades; never update a career portfolio.
---

# Check and update why-hire-me skills

Run `node scripts/check-version.mjs` from this skill directory. The check contacts only the
official GitHub release API, sends no career content, caches the release version locally for
four hours, and returns machine-readable status. If the user requires an offline session,
use the cached status only with `--offline`; do not contact GitHub. A failed or unknown check
must not interrupt the user's career task.

If the installed version is older, mention the available version once in the conversation.
Do not update automatically. Explain that updating changes the local agent instructions,
then ask the user before running `npx skills update` on this package's named skills. After
approval, use the installer for the person's chosen scope (`-g` for global installations,
project scope otherwise). Derive the exact installed skill names from the installer's lock
entries whose source is `rajanrx/why-hire-me`; do not update unrelated entries or guess at
missing provenance. Use `npx skills update <those names> -g -y` for a global installation,
or the project equivalent. Inspect its result and ask the person to restart their AI app
if the host requires a restart.

An update is not a portfolio migration. Leave career data, local portfolios, and live
deployments untouched. Route later portfolio work through `output-career-portfolio`.

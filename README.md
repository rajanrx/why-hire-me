# Why Hire Me

Build a portable, evidence-backed knowledge profile that AI agents can explore—making hiring
deeper, fairer, and asynchronous.

This repository currently contains the product intent, ontology, architecture decisions, and the
first installable AI skills. The architecture is local-first, person-controlled, and hexagonal:
sources and destinations are replaceable adapters around governed semantic knowledge.

Start with [`intent/specs/prd.md`](intent/specs/prd.md) and
[`intent/specs/architecture.md`](intent/specs/architecture.md).

## Development

Requirements: Node.js 22 or newer and pnpm 10.

```sh
pnpm install
pnpm run check
pnpm run spec:validate
pnpm run cli profile create --name "Your Name"
pnpm run cli source ingest --profile "<profile-id>" --file "<resume-or-work-file>"
```

The CLI stores local data under `~/.why-hire-me` by default. Set `WHY_HIRE_ME_HOME` or pass
`--database <path>` to use another location.

## Change workflow

OpenSpec changes live under `openspec/changes`. The project schema requires a typed `intent.yaml`
linking every change to durable product intent, followed by one quick review before implementation.
It deliberately does not require a review council.

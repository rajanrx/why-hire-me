---
id: std-domain-dependencies
status: active
version: 1.0.0
date: 2026-09-14
owner: architecture
enforced_by: src/architecture-boundaries.test.ts
---

# Standard: Domain dependencies

## Rule

Production modules under `src/domains/<domain>` must not import another domain, an adapter, or an
application entry point. Each domain owns the ports for capabilities it needs.

## Allowed composition

- Code within one domain may depend on that domain's model, application services, and ports.
- Adapters may implement ports from one or more domains when they translate rather than bypass rules.
- App composition may connect domain ports and adapters.
- Tests may compose production modules across boundaries.

## Enforcement

The architecture test scans production TypeScript files, identifies each containing domain, and
fails any import that resolves outside that domain or into `src/adapters` or `src/apps`.

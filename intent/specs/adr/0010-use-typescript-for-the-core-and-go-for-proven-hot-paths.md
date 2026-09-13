---
id: adr-0010
status: accepted
date: 2026-09-13
owner: architecture
---

# ADR-0010: Use TypeScript for the core and Go for proven hot paths

## Context

The product needs an installable plugin, agent-facing tools, a local CLI, governed domain logic,
and replaceable connectors. Some future workloads—such as large workspace scans, parsing, indexing,
or concurrent projection—may need tighter control over throughput and memory.

Using two languages throughout the domain would increase build, packaging, testing, and debugging
cost before those performance needs are measured.

## Decision

TypeScript on Node.js is the primary runtime for domain logic, application use cases, plugin tools,
the CLI, and ordinary adapters. The first persistence adapter uses SQLite; source snapshots and
release assets remain ordinary files behind ports.

Go is reserved for capabilities with a measured performance or operational reason. A Go component
must sit behind a versioned application port and run as a replaceable adapter or worker. It must not
own domain rules, write directly to another module's tables, or require the canonical model to use
Go-specific types.

Local Go integrations should begin out of process with explicit request and response contracts.
FFI and shared-memory coupling require a separate decision. A benchmark against the TypeScript
implementation is required before a Go implementation becomes the default.

## Consequences

- Most contributors and plugin hosts use one product runtime.
- Go can accelerate large or concurrent workloads without splitting the domain model.
- Cross-language contracts receive compatibility and conformance tests.
- Some performance-sensitive work may initially remain in TypeScript until profiling justifies the
  extra component.
- Packaging must account for platform-specific Go binaries when the first accelerator is added.


# Why Hire Me

**Turn the real evidence behind your career into private knowledge that AI can explore—and share
only the story you choose.**

A CV cannot hold every decision, contribution, lesson, credential, or piece of work that shows what
you can do. Why Hire Me helps you recover that context, connect it to evidence, and use AI for
thoughtful, asynchronous career conversations.

## 🚀 Start in three steps

| Step | What to do | Status |
|---|---|---|
| 1 · Install | Run `npx skills add rajanrx/why-hire-me --skill '*' -g`, choose your AI app, then restart it | ✅ Available |
| 2 · Explore | Ask: “Use `why-hire-me:evidence-led-interviewer` to explore this project and understand my contribution.” | ✅ Available |
| 3 · Share | Review your knowledge, generate an offline career portfolio, then optionally publish it through the platform of your choice | 🧭 Portfolio planned |

You stay in control throughout. AI may explore and propose; you decide what becomes trusted
knowledge and what can leave your computer.

## ✨ AI skills

| Skill | What it helps you do | Status |
|---|---|---|
| `why-hire-me:evidence-led-interviewer` | Explore career evidence and ask focused follow-up questions without unsupported profiling | ✅ Available |
| `why-hire-me:daily-work-diary` | Privately reconstruct your day, decisions, progress, and learning before useful details disappear | ✅ Available |
| `why-hire-me:career-portfolio` | Generate an appealing offline HTML portfolio with an overview, evidence graph, and résumé | 🧭 Planned |

Plugin-aware hosts use the `why-hire-me:<skill>` namespace. Skill-only hosts may show the same
capabilities without the prefix because individual skill names stay portable. The installer
supports Codex, Claude Code, Gemini CLI, Qwen Code, and other compatible agent hosts.

Other useful prompts:

- “Use `why-hire-me:daily-work-diary` to help me remember what I achieved today.”
- “Find the strongest evidence of my contribution and ask about anything important that is
  missing.”
- “Help me prepare career evidence for an asynchronous interview without scoring or profiling me.”

### Claude Code plugin marketplace

```sh
claude plugin marketplace add rajanrx/why-hire-me
claude plugin install why-hire-me@why-hire-me
```

## 🧭 From career evidence to something people can explore

```mermaid
flowchart LR
    Sources[📄 Career sources] --> Explore[✨ AI exploration]
    Explore --> Review[✅ Your review]
    Review --> Knowledge[🧠 Trusted knowledge]
    Knowledge --> View[🔐 Authorised view]
    View --> Local[🖥️ Offline portfolio]
    View --> Connectors[🔌 Optional destinations]
```

The design works across professions. A résumé, portfolio, document, credential, link, work sample,
or selected source-code folder can be an input. Source-code inspection is one adapter, not an
assumption about the person or their role.

The local runtime can already capture a selected text file, preserve an immutable snapshot, create
precise citations, stage typed entities, and record an accept, reject, or defer decision. Only
accepted proposals become canonical knowledge.

## 🌐 Your career portfolio, local first

The planned `career-portfolio` output will turn one authorised, versioned knowledge release into a
polished static HTML portfolio containing:

- a clear career overview;
- an explorable graph of roles, organisations, work, contributions, technologies, and credentials;
- an evidence-backed résumé that is easy to read and print; and
- visible sources, limitations, release version, and freshness information.

The report will work locally without an account, analytics, remote fonts, or a network connection.
It will remain an output projection—not a second source of truth—and will never add unreviewed
claims.

Hosted sharing will use replaceable destination adapters, so people can choose the platform that
suits them. Firebase Hosting is one possible adapter, not an architectural dependency. After
explicit sign-in and a final preview, a connector can publish the same static portfolio and return
its shareable address. Credentials stay outside the release, and “uploaded” remains distinct from
“public”. The offline report keeps working without any hosted platform. Pricing and quotas belong
to the selected destination rather than the core product.

## 🛡️ Trust is part of the product

| Principle | What it means |
|---|---|
| 🔐 Private by default | Sources and knowledge stay local unless you approve a bounded output |
| 🔎 Evidence first | Factual knowledge keeps its source and derivation instead of becoming generated prose |
| ✅ Human reviewed | AI cannot promote its own proposals into trusted knowledge |
| 🔌 Vendor independent | GPT, Gemini, NotebookLM, GitHub, Firebase, and future systems remain replaceable adapters |
| 📦 Portable | Versioned releases can be validated and used without the original application |
| ⚖️ Hiring aware | Discovery stays separate from formal evaluation, scoring, or hiring decisions |

## 🏗️ Built to grow without losing its centre

Why Hire Me uses hexagonal architecture. Domain and application code own the ports; filesystems,
SQLite, AI providers, interfaces, and publication destinations plug in as replaceable adapters.
TypeScript is the primary runtime. Go is reserved for a measured performance bottleneck behind a
versioned port.

Developers can follow the complete [local CLI guide](https://github.com/rajanrx/why-hire-me/blob/main/docs/development-cli.md).
The durable design lives in the [product requirements](https://github.com/rajanrx/why-hire-me/blob/main/intent/specs/prd.md),
[architecture](https://github.com/rajanrx/why-hire-me/blob/main/intent/specs/architecture.md),
[ontology](https://github.com/rajanrx/why-hire-me/blob/main/intent/specs/_ontology.md), and
[first-release RFC](https://github.com/rajanrx/why-hire-me/blob/main/intent/specs/rfc/RFC-001-first-knowledge-release.md).
Development intent, OpenSpec changes, source files, and tests stay in the repository rather than the
end-user release archive.

## 📜 Licence and project identity

Why Hire Me is open-source software licensed under [GNU AGPL-3.0-or-later](LICENSE). You may use,
study, modify, and redistribute it under that licence. Modified versions operated over a network
must offer their corresponding source as required by the AGPL.

The [trademark policy](TRADEMARKS.md) protects the Why Hire Me name and branding. Forks may describe
their origin or compatibility, but they must use a distinct product identity and must not imply
official approval.

> [!important] Your next steps
> - [ ] Install the available AI skills.
> - [ ] Start one evidence-led career conversation.
> - [ ] Follow the project to help shape the offline portfolio and optional hosted sharing.

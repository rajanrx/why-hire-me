---
id: glossary
status: draft
version: 0.1.0
date: 2026-09-13
owner: product/domain
---

# Domain Glossary

These terms are canonical across domains. Domain documents may refine them but must not silently
change their meaning.

| Term | Meaning |
|---|---|
| **Person** | The human represented by and controlling a knowledge space. “Candidate” is a temporary evaluation role. |
| **Knowledge space** | The governed collection of canonical knowledge controlled for one person. |
| **Source** | An origin from which material may be captured. |
| **Source connection** | Revocable authority and configuration for accessing a source. |
| **Snapshot** | The immutable or tamper-evident source content actually processed. |
| **Evidence** | A precise locator into a snapshot that supports or contradicts a claim. |
| **Entity** | A stable identified thing, such as a person, organisation, work, or technology. |
| **Claim** | A first-class, attributable statement about an entity; not automatically a fact. |
| **Organisation** | A company, institution, client, issuer, community, or other organised body. |
| **Engagement** | A time-bounded relationship between a person and an organisation. |
| **Role** | A capacity and set of responsibilities held within an engagement or work. |
| **Work** | A project, product, publication, design, case, performance, decision, or other outcome. |
| **Contribution** | What a person or agent did in relation to work. |
| **Artefact** | A tangible output or record of work. |
| **Technology** | A tool, method, platform, language, framework, or technique. |
| **Technology use** | Contextual use of a technology in work or a contribution. |
| **Credential** | A qualification, certification, licence, award, or attestation issued to a subject. |
| **Alias** | A name or identifier used for lookup in a declared namespace; not a second entity. |
| **Activity** | A recorded capture, derivation, review, admission, publication, or evaluation action. |
| **Agent** | A person, organisation, system, or model responsible for a claim or activity. |
| **Candidate knowledge** | A typed proposal awaiting admission; never canonical merely because AI produced it. |
| **Canonical knowledge** | Admitted entities and claims governed by Person Knowledge. |
| **Admission** | The decision that accepts, rejects, or defers candidate knowledge under explicit rules. |
| **Grant** | Revocable permission for an audience, purpose, duration, and bounded knowledge set. |
| **View** | A versioned selection of canonical knowledge produced after policy evaluation. |
| **Release** | An immutable, vendor-neutral publication of a versioned view. |
| **Projection** | A replaceable representation or index derived from canonical knowledge or a release. |
| **Delivery** | An attempt to publish a release projection to a destination. |
| **Evaluation** | A contextual assessment of one person for one opportunity. |
| **Interview** | One questioning method inside discovery or evaluation; its mode must be explicit. |
| **Finding** | An attributable interpretation about an evaluation criterion, supported by evidence. |
| **Port** | A core-owned contract expressing a use case or external capability. |
| **Adapter** | An implementation translating a port to a framework, system, protocol, model, or store. |
| **Connector** | A versioned adapter for a particular source or destination family. |
| **Tool** | An operation exposed for a human or agent to invoke. |
| **Skill** | A governed workflow coordinating tools; it does not own domain truth. |

## Avoid

- Use **claim**, not “fact”, unless the verification basis is stated.
- Use **person**, not “candidate”, outside an evaluation.
- Use **assessment** or **evaluation**, not a universal judgement or person score.
- Use **logical graph**, not “graph database”, unless discussing physical storage.
- Use **release** for the portable output and **delivery** for GitHub, NotebookLM, or another target.
- Do not use **skill** for a technology tag or an agent workflow without qualifying which meaning is intended.

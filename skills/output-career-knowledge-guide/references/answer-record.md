# Career knowledge answer record

Use this contract when a structured or auditable answer is requested. Do not include records or
policy details that the authorised view does not permit the audience to see.

```yaml
schemaVersion: "0.1"
recordType: CareerKnowledgeAnswer
mode: governed-view | supplied-release | no-authorised-view
status: answered | partially-answered | refused | blocked
audience:
  id: string | anonymous | unknown
  purpose: string
view:
  id: string | null
  version: string | null
  owner: string | unknown
  createdAt: RFC-3339-timestamp | null
  expiresAt: RFC-3339-timestamp | null
  validation: validated | partially-validated | unvalidated | invalid | unavailable
question:
  text: string
  clarifiedMeaning: string | null
answer:
  classification: supported | qualified | not-in-view | withheld | stale | conflicting | invalid-view
  text: string
  retrievedRecordIds: []
  citations:
    - claim: string
      recordIds: []
      evidenceLocators: []
      freshness: current | stale | unknown
      uncertainty: string | null
  limitations: []
delivery:
  destination: local-conversation | named-authorised-destination
  delivered: true | false
aiTrace:
  skillVersion: string
  model: string | unknown
```

`not-in-view` means the bounded projection cannot answer; it is not a claim about the person's full
career. `withheld` must not reveal hidden record details. `delivered=true` for a named destination
requires a confirmed output action, not a draft or attempted call.

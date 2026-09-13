# Daily diary record

The diary is useful as a human-readable reflection and as a source of reviewed knowledge candidates.
Keep those outputs separate.

## Diary entry

```yaml
recordType: DailyDiaryEntry
schemaVersion: "0.1"
id: stable-id
knowledgeSpaceId: stable-id
diaryDate: YYYY-MM-DD
timezone: IANA-timezone
author: agent-or-person-id
createdAt: RFC-3339-timestamp
privacy: private
status: proposed | confirmed | corrected
supersedes: null
summary: "..."
episodes: []
unresolvedQuestions: []
nextIntentions: []
```

## Work episode

Each episode may contain:

- stable episode ID;
- title or short description;
- related Work, Organisation, Engagement, Role, or Contribution IDs when known;
- the person's account of actions and decisions;
- collaborators described only as specifically and privately as needed;
- constraints, alternatives, outcome, blocker, learning, and current state;
- evidence references with authorised source locators;
- uncertainty and missing context; and
- candidate knowledge IDs proposed from the episode.

Do not force absent fields. `unknown` is preferable to inference.

## Candidate knowledge

Potential durable knowledge—such as a contribution, decision, technology use, work outcome, or new
relationship—is emitted separately through the Knowledge Enrichment candidate contract. It must
include provenance back to the diary episode and any supporting evidence, then pass normal admission.

Routine activity, private reflection, tentative thoughts, sensitive third-party information, and
future intentions remain in the diary unless the person explicitly promotes them.

## Corrections

A confirmed entry is corrected by creating a new entry that references `supersedes`. The current
view shows the latest allowed version while preserving history subject to the person's deletion and
retention policy.

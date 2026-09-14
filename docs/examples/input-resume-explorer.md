# Résumé explorer example

Use this skill to inventory an authorised résumé completely before asking the AI to choose the most
prominent stories.

## Prompt with an attachment

```text
Use why-hire-me:input-resume-explorer on the résumé I attached. Keep it private.
Inventory every substantive source unit before selecting stories. Preserve distinct achievements
within long roles, split compound bullets where their products or outcomes differ, reconcile the
coverage ledger, and then ask about the highest-value evidence gaps.
```

## Expected coverage excerpt

This fictional role deliberately contains several achievements, including late bullets. The ledger
does not assume they are equally important; it guarantees that prioritisation cannot erase them.

```yaml
schemaVersion: "0.2"
mode: session-only
status: not-persisted
source:
  name: resume.pdf
  locatorScheme: structured
sourceUnits:
  - id: northstar-bullet-1
    locator: experience/northstar/bullet/1
    kind: contribution
    faithfulMeaning: Built the analytics warehouse and reporting model.
    engagementId: engagement-northstar
    roleId: role-platform-lead
    parentSourceUnitId: null
    disposition:
      kind: proposed-entity
      proposalIds: [work-analytics-foundation]
  - id: northstar-bullet-2
    locator: experience/northstar/bullet/2
    kind: project
    faithfulMeaning: Built a live reporting product for operational users.
    engagementId: engagement-northstar
    roleId: role-platform-lead
    parentSourceUnitId: null
    disposition:
      kind: proposed-entity
      proposalIds: [work-live-reporting-product]
  - id: northstar-bullet-6
    locator: experience/northstar/bullet/6
    kind: employment-bullet
    faithfulMeaning: Delivered a retail gift-card product and integrated operational data with a CRM.
    engagementId: engagement-northstar
    roleId: role-platform-lead
    parentSourceUnitId: null
    disposition:
      kind: split
      splitIntoSourceUnitIds: [northstar-bullet-6a, northstar-bullet-6b]
      rationale: The source unit names different products, audiences, and integration evidence.
  - id: northstar-bullet-6a
    locator: experience/northstar/bullet/6#gift-card
    kind: contribution
    faithfulMeaning: Delivered a retail gift-card product.
    engagementId: engagement-northstar
    roleId: role-platform-lead
    parentSourceUnitId: northstar-bullet-6
    disposition:
      kind: proposed-entity
      proposalIds: [work-retail-gift-card]
  - id: northstar-bullet-6b
    locator: experience/northstar/bullet/6#crm
    kind: contribution
    faithfulMeaning: Integrated operational data with a CRM.
    engagementId: engagement-northstar
    roleId: role-platform-lead
    parentSourceUnitId: northstar-bullet-6
    disposition:
      kind: proposed-entity
      proposalIds: [work-crm-integration]
  - id: northstar-bullet-8
    locator: experience/northstar/bullet/8
    kind: contribution
    faithfulMeaning: Built a recommendation service using behavioural data.
    engagementId: engagement-northstar
    roleId: role-platform-lead
    parentSourceUnitId: null
    disposition:
      kind: proposed-entity
      proposalIds: [work-recommendation-service]
coverage:
  status: reconciled
  counts:
    total: 10
    captured: 9
    merged: 0
    excluded: 0
    ambiguous: 0
    split: 1
    unresolved: 0
  unresolvedSourceUnitIds: []
```

The complete result contains every source unit, not only this excerpt. `session-only` still means the
host did not persist governed evidence. If even one late bullet lacked a disposition, coverage would
be `unresolved` and the skill could not describe exploration as complete.

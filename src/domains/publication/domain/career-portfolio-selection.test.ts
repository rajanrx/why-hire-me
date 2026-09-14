import assert from "node:assert/strict";
import test from "node:test";

import { authorisedPortfolioAchievements, reconcilePortfolioInclusion, type PortfolioInclusionDecision } from "./career-portfolio-selection.js";
import type { ReleaseInputRecord } from "./knowledge-release.js";

function record(id: string, entityType: string): ReleaseInputRecord {
  return { schemaVersion: "0.1", id, recordType: "Entity", knowledgeSpaceId: "profile", status: "active",
    recordedAt: "2026-09-15T00:00:00.000Z", generatedBy: "activity", policyLabels: ["shareable"], supersedes: null,
    data: { entityType, attributes: { displayName: id.replaceAll("-", " ") } } };
}

const outcome: ReleaseInputRecord = { ...record("outcome-latency", "Work"), recordType: "Claim",
  data: { claimType: "reported-outcome", statement: "Reported latency reduction" } };
const records = [record("work-analytics", "Work"), record("work-live-reporting", "Work"),
  record("contribution-payments", "Contribution"), record("technology-go", "Technology"), outcome];

const completeDecisions: readonly PortfolioInclusionDecision[] = [
  { recordId: "work-analytics", status: "featured", rationale: "Strong audience relevance and evidence.", summarisedUnderRecordId: null },
  { recordId: "work-live-reporting", status: "supporting", rationale: "Distinct product retained in the work index.", summarisedUnderRecordId: null },
  { recordId: "contribution-payments", status: "summarised", rationale: "Retained beneath its related work narrative.", summarisedUnderRecordId: "work-analytics" },
  { recordId: "outcome-latency", status: "supporting", rationale: "Reported result retained with its qualification.", summarisedUnderRecordId: null },
];

test("requires an inclusion decision for every authorised achievement but not every entity", () => {
  const achievements = authorisedPortfolioAchievements(records);
  assert.deepEqual(achievements.map((item) => item.recordId), ["contribution-payments", "outcome-latency", "work-analytics", "work-live-reporting"]);
  assert.equal(achievements.find((item) => item.recordId === "outcome-latency")?.label, "Reported latency reduction");
  const result = reconcilePortfolioInclusion(achievements, completeDecisions);
  assert.equal(result.complete, true);
  assert.deepEqual(result.counts, { featured: 1, supporting: 2, summarised: 1, excluded: 0, deferred: 0 });
});

test("blocks generation for unexplained omissions and deferred decisions", () => {
  const achievements = authorisedPortfolioAchievements(records);
  const missing = reconcilePortfolioInclusion(achievements, completeDecisions.filter((item) => item.recordId !== "work-live-reporting"));
  assert.equal(missing.complete, false);
  assert.deepEqual(missing.unresolvedRecordIds, ["work-live-reporting"]);
  const deferred = reconcilePortfolioInclusion(achievements, completeDecisions.map((item) => item.recordId === "work-live-reporting"
    ? { ...item, status: "deferred" as const } : item));
  assert.equal(deferred.complete, false);
  assert.deepEqual(deferred.unresolvedRecordIds, ["work-live-reporting"]);
});

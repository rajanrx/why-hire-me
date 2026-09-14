import assert from "node:assert/strict";
import test from "node:test";

import { reconcileResumeSourceCoverage, type ResumeSourceDisposition, type ResumeSourceUnit } from "./resume-source-coverage.js";

const units: readonly ResumeSourceUnit[] = [
  { id: "role-1", locator: "experience/acme", kind: "project", faithfulMeaning: "A long engagement.", engagementId: "engagement-1", roleId: "role-1", parentSourceUnitId: null },
  { id: "bullet-1", locator: "experience/acme/bullet/1", kind: "contribution", faithfulMeaning: "Built an analytics warehouse.", engagementId: "engagement-1", roleId: "role-1", parentSourceUnitId: null },
  { id: "bullet-2", locator: "experience/acme/bullet/2", kind: "employment-bullet", faithfulMeaning: "Built a web and mobile reporting product.", engagementId: "engagement-1", roleId: "role-1", parentSourceUnitId: null },
  { id: "bullet-3", locator: "experience/acme/bullet/3", kind: "contribution", faithfulMeaning: "Integrated a payment service.", engagementId: "engagement-1", roleId: "role-1", parentSourceUnitId: null },
  { id: "bullet-4", locator: "experience/acme/bullet/4", kind: "employment-bullet", faithfulMeaning: "Delivered a retail gift-card solution and a CRM integration.", engagementId: "engagement-1", roleId: "role-1", parentSourceUnitId: null },
  { id: "bullet-4a", locator: "experience/acme/bullet/4#gift-card", kind: "contribution", faithfulMeaning: "Delivered a retail gift-card solution.", engagementId: "engagement-1", roleId: "role-1", parentSourceUnitId: "bullet-4" },
  { id: "bullet-4b", locator: "experience/acme/bullet/4#crm", kind: "contribution", faithfulMeaning: "Integrated operational data with a CRM.", engagementId: "engagement-1", roleId: "role-1", parentSourceUnitId: "bullet-4" },
  { id: "bullet-5", locator: "experience/acme/bullet/5", kind: "contribution", faithfulMeaning: "Built recommendations using behavioural data.", engagementId: "engagement-1", roleId: "role-1", parentSourceUnitId: null },
  { id: "bullet-6", locator: "experience/acme/bullet/6", kind: "technology-use", faithfulMeaning: "Used an event stream for integration delivery.", engagementId: "engagement-1", roleId: "role-1", parentSourceUnitId: null },
];

const dispositions: readonly ResumeSourceDisposition[] = [
  { sourceUnitId: "role-1", kind: "proposed-entity", proposalIds: ["engagement-proposal-1"] },
  { sourceUnitId: "bullet-1", kind: "proposed-entity", proposalIds: ["work-analytics"] },
  { sourceUnitId: "bullet-2", kind: "proposed-entity", proposalIds: ["work-live-product"] },
  { sourceUnitId: "bullet-3", kind: "proposed-entity", proposalIds: ["work-payments"] },
  { sourceUnitId: "bullet-4", kind: "split", splitIntoSourceUnitIds: ["bullet-4a", "bullet-4b"], rationale: "The bullet describes different products, audiences, and integrations." },
  { sourceUnitId: "bullet-4a", kind: "proposed-entity", proposalIds: ["work-gift-card"] },
  { sourceUnitId: "bullet-4b", kind: "proposed-entity", proposalIds: ["work-crm"] },
  { sourceUnitId: "bullet-5", kind: "proposed-entity", proposalIds: ["work-recommendations"] },
  { sourceUnitId: "bullet-6", kind: "proposed-entity", proposalIds: ["technology-use-event-stream"] },
];

test("reconciles every source unit and preserves late and split achievements", () => {
  const result = reconcileResumeSourceCoverage(units, dispositions);
  assert.equal(result.complete, true);
  assert.deepEqual(result.counts, { total: 9, captured: 8, merged: 0, excluded: 0, ambiguous: 0, split: 1, unresolved: 0 });
  assert.ok(dispositions.some((item) => item.sourceUnitId === "bullet-6"));
  assert.notEqual(dispositions.find((item) => item.sourceUnitId === "bullet-4a"), dispositions.find((item) => item.sourceUnitId === "bullet-4b"));
});

test("cannot complete while a later source unit has no disposition", () => {
  const result = reconcileResumeSourceCoverage(units, dispositions.filter((item) => item.sourceUnitId !== "bullet-6"));
  assert.equal(result.complete, false);
  assert.deepEqual(result.unresolvedSourceUnitIds, ["bullet-6"]);
});

test("rejects silent merging and broken compound splits", () => {
  const broken = dispositions.map((item) => item.sourceUnitId === "bullet-4"
    ? { ...item, splitIntoSourceUnitIds: ["bullet-4a"] } as ResumeSourceDisposition : item);
  const result = reconcileResumeSourceCoverage(units, broken);
  assert.equal(result.complete, false);
  assert.ok(result.errors.some((error) => error.includes("at least two")));
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import type { CareerPortfolioDisplayItem, CareerPortfolioDisplayModel } from "../../domains/publication/domain/career-portfolio-display.js";
import { careerProfileView } from "./career-profile-view.js";
import { releaseDisplayModel } from "./static-html-career-portfolio-renderer.js";

const item = (id: string, type: string, extra: Partial<CareerPortfolioDisplayItem> = {}): CareerPortfolioDisplayItem =>
  ({ id, type, name: id, summary: null, recordedAt: "2026-01-01", details: [], inclusion: null, ...extra });
const decision = (recordId: string, status: "featured" | "supporting" | "summarised", under: string | null = null) =>
  ({ recordId, status, rationale: "reviewed", summarisedUnderRecordId: under });
const relation = (subject: string, object: string, predicate = "any.predicate") =>
  ({ id: `${subject}-${object}`, subject, object, predicate });

const model = (overrides: Partial<CareerPortfolioDisplayModel> = {}): CareerPortfolioDisplayModel => ({
  schema: "why-hire-me.portfolio-display/v1", subjectDisplayName: "Sam Example", purpose: "public portfolio",
  audience: "public", resumeLength: "complete", relations: [], links: [], assets: [], limitations: [],
  provenance: { mode: "local-prototype", packetId: "p", reviewedBy: "Sam", reviewReference: "r",
    validation: "partially-validated", status: "session-only", generatedAt: "2026-01-01" },
  items: [
    item("P", "Person", { summary: "Builds payment platforms.", details: [{ label: "Location", value: "Perth" }] }),
    item("E1", "Engagement", { summary: "Platform lead.", details: [{ label: "Period", value: "2024–present" }] }),
    item("R1", "Role", { name: "Principal Engineer" }), item("O1", "Organisation", { name: "Acme" }),
    item("W1", "Work", { inclusion: decision("W1", "featured") }),
    item("W2", "Work", { inclusion: decision("W2", "supporting") }),
    item("W3", "Work", { inclusion: decision("W3", "featured") }),
    item("X1", "Reported outcome", { inclusion: decision("X1", "summarised", "W1") }),
    item("X2", "Reported outcome", { inclusion: decision("X2", "summarised", "W1") }),
    item("X3", "Reported outcome", { inclusion: decision("X3", "summarised", "W3") }),
    item("T1", "Technology", { name: "Go" }), item("TU1", "TechnologyUse"), item("C1", "TechnologyCategory", { name: "Languages" }),
    item("T2", "Technology", { name: "Kafka" }),
  ],
  ...overrides,
});
const relations = [relation("E1", "R1"), relation("E1", "O1"), relation("E1", "W1"), relation("E1", "W2"),
  relation("E1", "W3"), relation("X1", "W1"), relation("X2", "W1"), relation("X3", "W3"),
  relation("TU1", "W1"), relation("TU1", "T1"), relation("T1", "C1"), relation("W2", "T2")];

test("profile is built from record types and approved priority, not predicates or IDs", () => {
  const view = careerProfileView(model({ relations }));
  assert.equal(view.headline, "Builds payment platforms.");
  assert.equal(view.location, "Perth");
  const [role] = view.roles;
  assert.deepEqual([role!.title, role!.organisation, role!.period], ["Principal Engineer", "Acme", "2024–present"]);
  assert.deepEqual(role!.featuredWork.map(work => work.id), ["W1", "W3"]);
  assert.deepEqual(role!.moreWork.map(work => work.id), ["W2"]);
  assert.deepEqual(role!.technologies.map(tech => tech.name).sort(), ["Go", "Kafka"]);
  // One tile per featured parent, in the parents' approved order.
  assert.deepEqual(view.impact.map(tile => tile.id), ["X1", "X3"]);
  assert.deepEqual(view.categories.map(category => [category.name, category.technologies.map(tech => tech.name)]),
    [["Languages", ["Go"]], ["Other", ["Kafka"]]]);
  assert.deepEqual(view.categories[0]!.technologies[0]!.usedAt.map(place => [place.organisation, place.title, place.period]),
    [["Acme", "Principal Engineer", "2024–present"]]);
});

test("missing approved content yields empty sections instead of filler", () => {
  const view = careerProfileView(model({ items: [item("E1", "Engagement")], relations: [] }));
  assert.equal(view.headline, null);
  assert.deepEqual(view.impact, []);
  assert.equal(view.notebookUrl, null);
  assert.equal(view.audioPath, null);
  assert.equal(view.roles[0]!.title, "E1");
});

test("only an explicit ai-notebook role becomes the notebook link", () => {
  const links = [{ id: "L1", targetRecordId: null, label: "Notebook", url: "https://notebook.example/1", sourceStatus: "separately-reviewed" as const }];
  assert.equal(careerProfileView(model({ links })).notebookUrl, null);
  assert.equal(careerProfileView(model({ links: [{ ...links[0]!, role: "ai-notebook" }] })).notebookUrl, "https://notebook.example/1");
});

test("the fictional sample release produces roles and technologies through its own predicates", async () => {
  const fixture = JSON.parse(await readFile("skills/output-career-portfolio/assets/sample-release.json", "utf8"));
  const view = careerProfileView(releaseDisplayModel(fixture.release, fixture.inclusionDecisions, fixture.options));
  assert.ok(view.roles.length > 0);
  assert.ok(view.roles.some(role => role.featuredWork.length > 0 && role.technologies.length > 0));
  assert.ok(view.categories.some(category => category.id !== null));
});

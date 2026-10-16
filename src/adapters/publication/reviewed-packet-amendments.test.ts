import assert from "node:assert/strict";
import test from "node:test";

import type { ReviewedLocalPrototypePacket } from "../../domains/publication/domain/career-portfolio-display.js";
import { adaptReviewedPrototype } from "./reviewed-prototype-display-adapter.js";
import { applyPacketAmendments, type PacketAmendments } from "./reviewed-packet-amendments.js";

const featured = { recordId: "work-1", status: "featured" as const, rationale: "Reviewed.", summarisedUnderRecordId: null };
const item = (id: string, type: string, name: string, summary: string | null, details: { label: string; value: string }[] = []) =>
  ({ id, type, name, summary, recordedAt: "2026-01-01", details, inclusion: id === "work-1" ? featured : null });
const packet: ReviewedLocalPrototypePacket = {
  schema: "why-hire-me.reviewed-prototype-packet/v1", packetId: "packet-1", subjectDisplayName: "Sam Example",
  purpose: "public portfolio", audience: "public", resumeLength: "two-pages",
  review: { reviewedBy: "Sam", reviewReference: "review-1", reviewedAt: "2026-01-01T00:00:00.000Z", disclosureChoices: [] },
  items: [item("person-1", "Person", "Sam Example", null), item("org-1", "Organisation", "Example Co", "Named initiatives: Old payments project."),
    item("eng-1", "Engagement", "Example Co · Lead", null),
    item("work-1", "Work", "Old payments project", null, [{ label: "Evidence", value: "résumé page 1" }])],
  relations: [["person-1", "eng-1"], ["eng-1", "org-1"], ["eng-1", "work-1"]].map(([subject, object], index) =>
    ({ id: `rel-${index}`, subject: subject!, object: object!, predicate: "any.relation", reviewed: true as const, reviewReference: "review-1" })),
  links: [], inclusionDecisions: [featured], technologyUseMap: [], referenceLinkMap: [],
  carryForwardMap: [{ baselineItemId: "item:work-1", itemType: "record", disposition: "preserved", newLocator: "portfolio.json#items/work-1", personApproved: true }],
  limitations: [],
};
const amendments: PacketAmendments = {
  schema: "why-hire-me.packet-amendments/v1", packetId: "packet-2", reviewedBy: "Sam approved interview answers",
  reviewedAt: "2026-10-15T00:00:00.000Z", evidence: "Sam's discovery interview · 2026-10-15",
  updates: [{ id: "work-1", name: "Payments rewrite", summary: "Rebuilt payments on a tested pipeline." }],
  additions: [{ item: { id: "outcome-1", type: "Reported outcome", name: "Onboarding from weeks to days", summary: null },
    engagementId: "eng-1", parentId: "work-1", inclusion: { status: "summarised", rationale: "Measured result.", summarisedUnderRecordId: "work-1" } }],
  limitations: ["Interview figures are person-stated."],
};

test("amendments apply idempotently, add linked outcomes, and carry renames into derived text", () => {
  const once = applyPacketAmendments(packet, amendments);
  const twice = applyPacketAmendments(once, amendments);
  assert.deepEqual(twice, once);
  const byId = new Map(once.items.map(record => [record.id, record]));
  assert.equal(byId.get("org-1")!.summary, "Named initiatives: Payments rewrite.");
  assert.equal(byId.get("work-1")!.details.find(detail => detail.label === "Evidence")!.value,
    "résumé page 1; Sam's discovery interview · 2026-10-15");
  assert.ok(once.relations.some(relation => relation.subject === "outcome-1" && relation.object === "work-1"));
  assert.equal(once.carryForwardMap[0]!.disposition, "reworded");
  assert.equal(once.packetId, "packet-2");
  assert.equal(packet.items[3]!.name, "Old payments project", "the input packet is not mutated");
  adaptReviewedPrototype(once);
});

test("amendments refuse unknown records instead of guessing", () => {
  assert.throws(() => applyPacketAmendments(packet, { ...amendments, updates: [{ id: "missing", summary: "x" }] }), /unknown record missing/);
});

const withTechnology: ReviewedLocalPrototypePacket = {
  ...packet,
  items: [...packet.items, item("cat-lang", "TechnologyCategory", "Languages", "Grouping.", [{ label: "Technologies", value: "Kotlin" }]),
    item("tech-kotlin", "Technology", "Kotlin", null, [{ label: "Linked work", value: "Old payments project" }])],
  relations: [...packet.relations,
    { id: "rel-cat", subject: "tech-kotlin", object: "cat-lang", predicate: "technology.belongs_to_category", reviewed: true, reviewReference: "review-1" },
    { id: "rel-use", subject: "work-1", object: "tech-kotlin", predicate: "record.has_contextual_technology", reviewed: true, reviewReference: "review-1" }],
};
const technologyAmendments: PacketAmendments = {
  ...amendments, updates: [], additions: [], limitations: [],
  categories: [{ name: "Observability" }],
  technologies: [{ name: "Grafana", category: "Observability", usedIn: ["work-1", "eng-1"] },
    { name: "Rust", category: "cat-lang", usedIn: ["work-1"] }],
  technologyUses: [{ id: "tu-eng-1", summary: "Rust and Grafana across Example Co.", workContextId: "eng-1", workContext: "Example Co platform" }],
};

test("technology amendments add categorised technologies and uses idempotently", () => {
  const once = applyPacketAmendments(withTechnology, technologyAmendments);
  assert.deepEqual(applyPacketAmendments(once, technologyAmendments), once);
  const byName = new Map(once.items.map(record => [record.name, record]));
  const grafana = byName.get("Grafana")!;
  assert.match(grafana.id, /^TECH-[0-9a-f]{12}$/);
  assert.equal(grafana.details.find(detail => detail.label === "Linked work")!.value, "Old payments project; Example Co · Lead");
  assert.equal(byName.get("Languages")!.details.find(detail => detail.label === "Technologies")!.value, "Kotlin · Rust");
  assert.equal(byName.get("Old payments project")!.details.find(detail => detail.label === "Contextual technologies")!.value, "Kotlin · Grafana · Rust");
  assert.ok(once.relations.some(r => r.subject === "tu-eng-1" && r.object === "eng-1" && r.predicate === "technology_use.in_context"));
  assert.deepEqual(once.technologyUseMap, [{ technologyUseId: "tu-eng-1", workContextId: "eng-1", status: "visible-in-context", targetRecordId: "eng-1" }]);
  adaptReviewedPrototype(once);
});

test("a technology moved to another category belongs only to the new one", () => {
  const moved = applyPacketAmendments(withTechnology, { ...technologyAmendments, technologyUses: [],
    technologies: [{ name: "Kotlin", category: "Observability" }] });
  assert.deepEqual(moved.relations.filter(r => r.subject === "tech-kotlin" && r.predicate === "technology.belongs_to_category").map(r => r.object),
    [moved.items.find(record => record.name === "Observability")!.id]);
  assert.equal(moved.items.find(record => record.id === "cat-lang")!.details.find(detail => detail.label === "Technologies")!.value, "Kotlin",
    "an emptied category keeps its last readout rather than inventing one");
});

test("technology amendments refuse near-duplicates and unknown references", () => {
  const only = (change: Partial<PacketAmendments>) => () => applyPacketAmendments(withTechnology, { ...technologyAmendments, technologyUses: [], ...change });
  assert.throws(only({ technologies: [{ name: "kotlin", category: "cat-lang" }] }), /tech-kotlin is already "Kotlin"/);
  assert.throws(only({ technologies: [{ name: "Rust", category: "Missing" }] }), /unknown category Missing/);
  assert.throws(only({ technologies: [{ name: "Rust", category: "cat-lang", usedIn: ["missing"] }] }), /unknown record missing/);
  assert.throws(only({ technologyUses: [{ id: "tu-x", summary: "x", workContextId: "missing", workContext: "x" }] }), /unknown work context missing/);
});

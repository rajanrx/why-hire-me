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

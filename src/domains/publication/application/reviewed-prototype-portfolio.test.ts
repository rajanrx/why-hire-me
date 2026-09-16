import assert from "node:assert/strict";
import test from "node:test";
import { adaptReviewedPrototype } from "../../../adapters/publication/reviewed-prototype-display-adapter.js";
import { StaticHtmlCareerPortfolioRenderer } from "../../../adapters/publication/static-html-career-portfolio-renderer.js";
import { NodeReleaseDigester } from "../../../adapters/publication/node-release-digester.js";
import { invalidCarryForwardLocators } from "../../../adapters/publication/prototype-carry-forward-validator.js";
import type { ReviewedLocalPrototypePacket } from "../domain/career-portfolio-display.js";

const decision = { recordId: "work-1", status: "featured" as const,
  rationale: "Person-reviewed portfolio item.", summarisedUnderRecordId: null };
const packet: ReviewedLocalPrototypePacket = {
  schema: "why-hire-me.reviewed-prototype-packet/v1", packetId: "packet-1",
  subjectDisplayName: "Reviewed Person", purpose: "side-by-side local preview", audience: "private",
  resumeLength: "complete", review: { reviewedBy: "the person", reviewReference: "review-1",
    reviewedAt: "2026-09-16T00:00:00.000Z", disclosureChoices: [
      { field: "Email", status: "omitted" }, { field: "Location", status: "approved-for-audience" },
    ] },
  items: [
    { id: "work-1", type: "Work", name: "Reviewed work", summary: "A reviewed summary.",
      recordedAt: "2026-09-16T00:00:00.000Z", details: [], inclusion: decision },
    { id: "technology-1", type: "Technology", name: "Graph engine", summary: null,
      recordedAt: "2026-09-16T00:00:00.000Z", details: [], inclusion: null },
  ],
  relations: [{ id: "relation-1", subject: "work-1", object: "technology-1",
    predicate: "work.uses_technology", reviewed: true, reviewReference: "review-1" }],
  links: [], inclusionDecisions: [decision], technologyUseMap: [], referenceLinkMap: [],
  carryForwardMap: [{ baselineItemId: "baseline-work-1", itemType: "achievement",
    disposition: "preserved", newLocator: "work-1", personApproved: true }],
  limitations: ["Local prototype; not a validated release."],
};

test("reviewed prototype adapter preserves truthful provenance and reviewed edges", () => {
  const model = adaptReviewedPrototype(packet);
  assert.equal(model.provenance.mode, "local-prototype");
  assert.deepEqual(model.relations, [{ id: "relation-1", subject: "work-1",
    object: "technology-1", predicate: "work.uses_technology" }]);
  const projection = new StaticHtmlCareerPortfolioRenderer(new NodeReleaseDigester())
    .renderDisplayModel(model, packet.inclusionDecisions);
  assert.equal(projection.manifest.rendererVersion, "0.4.2");
  assert.equal(projection.manifest.releaseId, null);
  assert.equal(projection.manifest.prototypeInput?.status, "session-only");
  assert.match(projection.files["app.js"], /cytoscape/);
  assert.match(projection.files["index.html"], /Local prototype · session-only · not governed/);
});

test("reviewed prototype adapter rejects invented or unreviewed edges", () => {
  const unreviewed = { ...packet, relations: [{ ...packet.relations[0], reviewed: false }] };
  assert.throws(() => adaptReviewedPrototype(unreviewed as unknown as ReviewedLocalPrototypePacket),
    /unreviewed, invalid, or dangling relationship/);
  const dangling = { ...packet, relations: [{ ...packet.relations[0], object: "invented-node" }] };
  assert.throws(() => adaptReviewedPrototype(dangling as ReviewedLocalPrototypePacket),
    /unreviewed, invalid, or dangling relationship/);
});

test("reviewed prototype adapter rejects omitted email anywhere in rendered text", () => {
  const leaked = { ...packet, items: packet.items.map(item => item.id === "work-1"
    ? { ...item, summary: "Contact reviewed.person@example.com for details." } : item) };
  assert.throws(() => adaptReviewedPrototype(leaked), /omitted disclosure field Email/);
});

test("reviewed prototype adapter rejects omitted phone, citizenship, address, and custom PII", () => {
  const cases = [
    { field: "Phone", leak: "Call +61 412 345 678 for details." },
    { field: "Citizenship", leak: "Australian citizen." },
    { field: "Address", leak: "Lives at 12 Example Street." },
    { field: "Employee identifier", leak: "Internal identifier SECRET-417.", matchValues: ["SECRET-417"] },
  ];
  for (const example of cases) {
    const disclosureChoices = [...packet.review.disclosureChoices,
      { field: example.field, status: "omitted" as const,
        ...(example.matchValues ? { matchValues: example.matchValues } : {}) }];
    const leaked = { ...packet, review: { ...packet.review, disclosureChoices },
      items: packet.items.map(item => item.id === "work-1" ? { ...item, summary: example.leak } : item) };
    assert.throws(() => adaptReviewedPrototype(leaked), new RegExp(`omitted disclosure field ${example.field}`));
  }
  const unspecified = { ...packet, review: { ...packet.review, disclosureChoices: [
    ...packet.review.disclosureChoices, { field: "Employee identifier", status: "omitted" as const },
  ] } };
  assert.throws(() => adaptReviewedPrototype(unspecified), /needs matchValues/);
});

test("reviewed prototype adapter rejects semantic duplicate relationships with different IDs", () => {
  const duplicate = { ...packet, relations: [...packet.relations,
    { ...packet.relations[0], id: "relation-copy" }] };
  assert.throws(() => adaptReviewedPrototype(duplicate as ReviewedLocalPrototypePacket),
    /invalid.*relationship/);
});

test("reviewed prototype adapter rejects invalid technology and reference mappings", () => {
  const technologyUse = { id: "technology-use-1", type: "TechnologyUse", name: "Graph engine use",
    summary: null, recordedAt: "2026-09-16T00:00:00.000Z", details: [], inclusion: null };
  const contextRelation = { id: "technology-context-1", subject: technologyUse.id, object: "work-1",
    predicate: "technology_use.in_context", reviewed: true as const, reviewReference: "review-1" };
  const invalidTechnology = { ...packet, items: [...packet.items, technologyUse],
    relations: [...packet.relations, contextRelation], technologyUseMap: [{ technologyUseId: technologyUse.id,
      workContextId: "work-1", status: "made-up", targetRecordId: "work-1" }] };
  assert.throws(() => adaptReviewedPrototype(invalidTechnology as unknown as ReviewedLocalPrototypePacket),
    /technology-use map/);

  const link = { id: "link-1", targetRecordId: "work-1", label: "Reviewed link",
    url: "https://example.com", sourceStatus: "supplied-unvisited" as const,
    reviewed: true as const, reviewReference: "review-1" };
  const mismatchedReference = { ...packet, links: [link], referenceLinkMap: [{ linkId: "link-1",
    status: "visible-on-work", targetRecordId: "technology-1" }] };
  assert.throws(() => adaptReviewedPrototype(mismatchedReference as unknown as ReviewedLocalPrototypePacket),
    /reference-link map/);
});

test("carry-forward validation rejects locators absent from candidate output", () => {
  const outputs = new Map<string, string | Uint8Array>([
    ["index.html", '<main id="experience"></main>'],
    ["portfolio.json", JSON.stringify({ displayModel: { items: [{ id: "work-1", name: "Reviewed work" }],
      relations: [{ id: "relation-1", subject: "work-1", object: "technology-1", predicate: "uses" }],
      links: [], assets: [] } })],
    ["resume.pdf", new TextEncoder().encode("/Type /Page /Type /Page")],
  ]);
  assert.deepEqual(invalidCarryForwardLocators([
    { baselineItemId: "present", disposition: "preserved", newLocator: "portfolio.json#items/work-1" },
    { baselineItemId: "present-relation", disposition: "preserved", newLocator: "portfolio.json#relations/relation-1" },
    { baselineItemId: "present-anchor", disposition: "preserved", newLocator: "index.html#experience" },
    { baselineItemId: "present-page", disposition: "preserved", newLocator: "resume.pdf#page=2" },
    { baselineItemId: "missing-fragment", disposition: "preserved", newLocator: "portfolio.json#does-not-exist" },
    { baselineItemId: "file-only", itemType: "record", disposition: "preserved", newLocator: "portfolio.json" },
    { baselineItemId: "missing-page", disposition: "preserved", newLocator: "resume.pdf#page=3" },
    { baselineItemId: "missing", disposition: "preserved", newLocator: "old/portfolio-data.js#work-1" },
    { baselineItemId: "excluded", disposition: "excluded", newLocator: null },
  ], outputs).map(item => item.baselineItemId), ["missing-fragment", "file-only", "missing-page", "missing"]);
});

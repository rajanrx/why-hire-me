import assert from "node:assert/strict";
import test from "node:test";
import { adaptReviewedPrototype } from "../../../adapters/publication/reviewed-prototype-display-adapter.js";
import { StaticHtmlCareerPortfolioRenderer } from "../../../adapters/publication/static-html-career-portfolio-renderer.js";
import { NodeReleaseDigester } from "../../../adapters/publication/node-release-digester.js";
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
  assert.equal(projection.manifest.rendererVersion, "0.4.0");
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


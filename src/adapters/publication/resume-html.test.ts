import assert from "node:assert/strict";
import test from "node:test";

import type { ReviewedLocalPrototypePacket } from "../../domains/publication/domain/career-portfolio-display.js";
import { adaptReviewedPrototype } from "./reviewed-prototype-display-adapter.js";
import { renderResumeHtml } from "./resume-html.js";

const featured = { recordId: "work-1", status: "featured" as const, rationale: "Reviewed.", summarisedUnderRecordId: null };
const supporting = { recordId: "work-2", status: "supporting" as const, rationale: "Reviewed.", summarisedUnderRecordId: null };
const item = (id: string, type: string, name: string, summary: string | null, inclusion: typeof featured | typeof supporting | null = null) =>
  ({ id, type, name, summary, recordedAt: "2026-10-15", details: [], inclusion });
const packet = (resumeLength: ReviewedLocalPrototypePacket["resumeLength"]): ReviewedLocalPrototypePacket => ({
  schema: "why-hire-me.reviewed-prototype-packet/v1", packetId: "packet-1", subjectDisplayName: "Sam Example",
  purpose: "public portfolio", audience: "public", resumeLength,
  review: { reviewedBy: "Sam", reviewReference: "review-1", reviewedAt: "2026-10-15T00:00:00.000Z", disclosureChoices: [] },
  items: [item("person-1", "Person", "Sam Example", "Builds <reliable> platforms."),
    item("eng-1", "Engagement", "Example Co · Lead", "Leads the platform team."),
    item("work-1", "Work", "Payments rewrite", "Rebuilt payments.", featured),
    item("work-2", "Work", "Hiring", "Ran interviews.", supporting)],
  relations: [["person-1", "eng-1"], ["eng-1", "work-1"], ["eng-1", "work-2"]].map(([subject, object], index) =>
    ({ id: `rel-${index}`, subject: subject!, object: object!, predicate: "any.relation", reviewed: true as const, reviewReference: "review-1" })),
  links: [], inclusionDecisions: [featured, supporting], technologyUseMap: [], referenceLinkMap: [], carryForwardMap: [], limitations: [],
});

test("the résumé uses only reviewed names and summaries, escaped, at the chosen depth", () => {
  const short = renderResumeHtml(adaptReviewedPrototype(packet("one-page")));
  const long = renderResumeHtml(adaptReviewedPrototype(packet("three-pages")));
  assert.match(short, /Builds &lt;reliable&gt; platforms\./);
  assert.match(short, /Payments rewrite/);
  assert.doesNotMatch(short, /Rebuilt payments|Hiring/, "one page shows featured titles only");
  assert.match(long, /Payments rewrite<\/strong> — Rebuilt payments\./);
  assert.match(long, /<strong>Hiring<\/strong><\/li>/, "supporting work is named without its summary");
  assert.match(renderResumeHtml(adaptReviewedPrototype(packet("complete"))), /Hiring<\/strong> — Ran interviews\./);
  assert.doesNotMatch(long, /<script/);
  assert.equal(renderResumeHtml(adaptReviewedPrototype(packet("three-pages"))), long, "same input, same bytes");
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import type { ReviewedLocalPrototypePacket } from "../../domains/publication/domain/career-portfolio-display.js";
import { careerPortfolioRenderer } from "./career-portfolio-renderers.js";
import { NodeReleaseDigester } from "./node-release-digester.js";
import { adaptReviewedPrototype } from "./reviewed-prototype-display-adapter.js";

const digester = new NodeReleaseDigester();
const fixture = JSON.parse(await readFile("skills/output-career-portfolio/assets/sample-release.json", "utf8"));
/** Recorded before template families existed; the default must never drift from it. */
const EDITORIAL_SAMPLE_DIGEST = "8fdee40530171df416aa670353fcf89ba6a1d114fee4020ea926ec6839e0224f";

const decision = { recordId: "work-1", status: "featured" as const, rationale: "Reviewed.", summarisedUnderRecordId: null };
const outcome = { recordId: "outcome-1", status: "summarised" as const, rationale: "Reviewed.", summarisedUnderRecordId: "work-1" };
const item = (id: string, type: string, inclusion: typeof decision | typeof outcome | null = null) =>
  ({ id, type, name: `${type} <b>${id}</b>`, summary: null, recordedAt: "2026-10-15", details: [], inclusion });
const basePacket: ReviewedLocalPrototypePacket = {
  schema: "why-hire-me.reviewed-prototype-packet/v1", packetId: "packet-1", subjectDisplayName: "Sam Example",
  purpose: "public portfolio", audience: "public", resumeLength: "two-pages",
  review: { reviewedBy: "Sam", reviewReference: "review-1", reviewedAt: "2026-10-15T00:00:00.000Z", disclosureChoices: [] },
  items: [item("person-1", "Person"), item("eng-1", "Engagement"), item("work-1", "Work", decision),
    item("outcome-1", "Reported outcome", outcome), item("tech-1", "Technology")],
  relations: [["person-1", "eng-1"], ["eng-1", "work-1"], ["outcome-1", "work-1"], ["work-1", "tech-1"]]
    .map(([subject, object], index) => ({ id: `rel-${index}`, subject: subject!, object: object!, predicate: "any.relation",
      reviewed: true as const, reviewReference: "review-1" })),
  links: [], inclusionDecisions: [decision, outcome], technologyUseMap: [], referenceLinkMap: [], carryForwardMap: [],
  limitations: [],
};
const notebook = { id: "nb", targetRecordId: null, label: "AI notebook", url: "https://notebook.example/abc",
  sourceStatus: "separately-reviewed" as const, reviewed: true as const, reviewReference: "review-1", role: "ai-notebook" as const };
const withNotebook = (approved: boolean): ReviewedLocalPrototypePacket => ({ ...basePacket,
  links: [notebook], referenceLinkMap: [{ linkId: "nb", status: "visible-in-evidence", targetRecordId: null }],
  review: { ...basePacket.review, disclosureChoices: approved ? [{ field: "AI notebook", status: "approved-for-audience" }] : [] } });
const render = (packet: ReviewedLocalPrototypePacket) =>
  careerPortfolioRenderer("material-profile", digester).renderDisplayModel(adaptReviewedPrototype(packet), packet.inclusionDecisions);

test("the default template stays byte-identical to the pre-template editorial output", () => {
  const projection = careerPortfolioRenderer(undefined, digester).render(fixture.release, fixture.inclusionDecisions, fixture.options);
  assert.equal(projection.manifest.projectionDigest, EDITORIAL_SAMPLE_DIGEST);
  assert.equal("template" in projection.manifest, false);
});

test("material-profile is recorded in identity and unknown families fail", () => {
  const projection = careerPortfolioRenderer("material-profile", digester).render(fixture.release, fixture.inclusionDecisions, fixture.options);
  assert.equal(projection.manifest.template, "material-profile");
  assert.equal(projection.manifest.rendererVersion, "1.0.0");
  assert.notEqual(projection.manifest.projectionDigest, EDITORIAL_SAMPLE_DIGEST);
  assert.throws(() => careerPortfolioRenderer("glossy", digester), /editorial-record, material-profile/);
});

test("material page is escaped, offline, and links only to records that exist", () => {
  const html = render(basePacket).files["index.html"];
  assert.doesNotMatch(html, /<b>work-1<\/b>/);
  assert.match(html, /data-template="material-profile"/);
  assert.match(html, /default-src 'none'/);
  assert.doesNotMatch(html, /media-src/);
  const external = [...html.matchAll(/(?:href|src)="(https?:[^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(external, ["https://github.com/rajanrx/why-hire-me"]);
  const ids = new Set(basePacket.items.map(entry => entry.id));
  for (const [, id] of html.matchAll(/href="#(?:entity|explore|career)\/([^"]+)"/g))
    assert.ok(ids.has(decodeURIComponent(id!)), `dangling fragment ${id}`);
  for (const destination of ["overview", "career", "skills", "explore", "records"])
    assert.match(html, new RegExp(`data-destination="${destination}"`));
  assert.match(html, /class="tile" href="#entity\/outcome-1"/, "summarised-under-featured outcome becomes an impact tile");
  assert.match(html, /id="relationship-list"/);
  assert.match(html, /class="resume-two-pages"/);
});

test("Ask appears only for an approved ai-notebook link", () => {
  assert.doesNotMatch(render(basePacket).files["index.html"], /data-destination="ask"|notebook\.example/);
  const html = render(withNotebook(true)).files["index.html"];
  assert.match(html, /data-destination="ask"/);
  assert.match(html, /href="https:\/\/notebook\.example\/abc" target="_blank" rel="noopener noreferrer"/);
  assert.throws(() => adaptReviewedPrototype(withNotebook(false)), /"AI notebook" disclosure is not approved/);
});

test("an audio overview needs its own approval and opens media-src only when present", () => {
  const audio = { ...basePacket, assets: [{ sourcePath: "/tmp/overview.mp3", outputPath: "overview.mp3", reviewed: true as const, reviewReference: "review-1" }] };
  assert.throws(() => adaptReviewedPrototype(audio), /"Audio overview" disclosure is not approved/);
  const approved = { ...audio, review: { ...audio.review, disclosureChoices: [{ field: "Audio overview", status: "approved-for-audience" as const }] } };
  const html = render(approved).files["index.html"];
  assert.match(html, /media-src 'self'/);
  assert.match(html, /<audio controls preload="none" src="overview\.mp3">/);
  assert.match(html, /AI-generated/);
});

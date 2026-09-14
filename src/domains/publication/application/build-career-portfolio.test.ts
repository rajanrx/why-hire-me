import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { LocalCareerPortfolioRepository } from "../../../adapters/publication/local-career-portfolio-repository.js";
import { NodeReleaseDigester } from "../../../adapters/publication/node-release-digester.js";
import { StaticHtmlCareerPortfolioRenderer } from "../../../adapters/publication/static-html-career-portfolio-renderer.js";
import type { ValidatedKnowledgeRelease } from "../domain/career-portfolio.js";
import type { KnowledgeReleaseManifest } from "../domain/knowledge-release.js";
import { BuildCareerPortfolio } from "./build-career-portfolio.js";
import type { PortfolioInclusionDecision } from "../domain/career-portfolio-selection.js";

const manifest = {
  schema: "why-hire-me.release/v0.1", releaseId: "release-0123456789abcdef01234567",
  releaseDigest: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  view: { id: "view-1", version: 1, knowledgeSpaceId: "profile-1", grantId: "grant-1", expiresAt: "2026-10-14T00:00:00.000Z" },
  subject: { displayName: "Ada <script>alert(1)</script>" }, purpose: "public portfolio", audience: "public",
  createdAt: "2026-09-14T00:00:00.000Z", files: [], counts: { "entities.ndjson": 1, "claims.ndjson": 0,
    "evidence.ndjson": 0, "activities.ndjson": 0, "aliases.ndjson": 0 },
  limitations: ["Claims are not included."], compatibility: { minimumReader: "0.1.0" },
} satisfies KnowledgeReleaseManifest;

const release: ValidatedKnowledgeRelease = { directory: "/release", manifest, records: [{
  schemaVersion: "0.1", id: "entity-1", recordType: "Entity", knowledgeSpaceId: "profile-1",
  status: "active", recordedAt: "2026-09-13T00:00:00.000Z", generatedBy: "activity-1", policyLabels: ["shareable"], supersedes: null,
  data: { entityType: "Work", attributes: { displayName: "Engine <img src=x onerror=alert(1)>" } },
}] };

const inclusion: readonly PortfolioInclusionDecision[] = [{ recordId: "entity-1", status: "featured",
  rationale: "Primary technical work for this audience.", summarisedUnderRecordId: null }];

test("renders deterministic, escaped, offline and accessible portfolio files", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-portfolio-"));
  try {
    const digester = new NodeReleaseDigester();
    const renderer = new StaticHtmlCareerPortfolioRenderer(digester);
    const useCase = new BuildCareerPortfolio({ readValidated: async () => release }, renderer,
      new LocalCareerPortfolioRepository(root, digester), { now: () => new Date("2026-09-14T01:00:00.000Z") });
    const preview = await useCase.preview({ releaseDirectory: "/release", inclusionDecisions: inclusion });
    assert.equal(preview.inclusion.complete, true);
    assert.equal(preview.approvedByPerson, false);
    const first = await useCase.execute({ releaseDirectory: "/release", inclusionDecisions: inclusion, approvedByPerson: true });
    const second = await useCase.execute({ releaseDirectory: "/release", inclusionDecisions: inclusion, approvedByPerson: true });
    const html = await readFile(join(first.directory, "index.html"), "utf8");
    assert.equal(first.reused, false);
    assert.equal(second.reused, true);
    assert.deepEqual(preview.projectionManifest, first.projection.manifest);
    assert.match(html, /Content-Security-Policy/);
    assert.match(html, /Skip to career record/);
    assert.match(html, /role="img"/);
    assert.match(html, /Relationship index/);
    assert.match(html, /Portfolio inclusion map/);
    assert.match(html, /No explicit claim relationships are present/);
    assert.doesNotMatch(html, /<img src=x/);
    assert.doesNotMatch(html, /https?:\/\//);
    assert.match(html, /&lt;script&gt;/);
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(first.projection.files["index.html"], renderer.render(release, inclusion).files["index.html"]);
    assert.match(first.projection.files["styles.css"], /color-scheme:light/);
    assert.match(first.projection.files["styles.css"], /@media print/);
    assert.doesNotMatch(first.projection.files["styles.css"], /prefers-color-scheme:dark/);
    await assert.rejects(() => useCase.execute({ releaseDirectory: "/release", inclusionDecisions: [], approvedByPerson: true }), /coverage is incomplete/);
    await assert.rejects(() => useCase.execute({ releaseDirectory: "/release", inclusionDecisions: inclusion, approvedByPerson: false }), /requires person approval/);
    await assert.rejects(() => new BuildCareerPortfolio({ readValidated: async () => release }, renderer,
      new LocalCareerPortfolioRepository(root, digester), { now: () => new Date("2026-10-14T00:00:00.000Z") })
      .execute({ releaseDirectory: "/release", inclusionDecisions: inclusion, approvedByPerson: true }), /authorisation has expired/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("keeps large record sets navigable and renders only explicit relationships", () => {
  const records: import("../domain/knowledge-release.js").ReleaseInputRecord[] = Array.from({ length: 22 }, (_, index) => ({
    schemaVersion: "0.1", id: `entity-${index}`, recordType: "Entity", knowledgeSpaceId: "profile-1",
    status: "active", recordedAt: "2026-09-13T00:00:00.000Z", generatedBy: "activity-1",
    policyLabels: ["shareable"], supersedes: null,
    data: { entityType: index === 0 ? "Work" : "Technology", attributes: { displayName: `Record ${index}` } },
  }));
  records.push({ schemaVersion: "0.1", id: "claim-1", recordType: "Claim", knowledgeSpaceId: "profile-1",
    status: "active", recordedAt: "2026-09-13T00:00:00.000Z", generatedBy: "activity-1",
    policyLabels: ["shareable"], supersedes: null,
    data: { subject: { ref: "entity-0" }, predicate: "work.has_technology_use", object: { ref: "entity-21" } } });
  const richRelease = { ...release, records };
  const decision = [{ recordId: "entity-0", status: "featured" as const,
    rationale: "Relevant work with explicit technical context.", summarisedUnderRecordId: null }];
  const projection = new StaticHtmlCareerPortfolioRenderer(new NodeReleaseDigester()).render(richRelease, decision);
  assert.equal([...projection.files["index.html"].matchAll(/class="graph-node"/g)].length, 22);
  assert.match(projection.files["index.html"], /work\.has_technology_use/);
  assert.match(projection.files["app.js"], /record-search/);
  assert.match(projection.files["app.js"], /keydown/);
  assert.doesNotMatch(projection.files["index.html"], /No explicit claim relationships are present/);
});

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

test("renders deterministic, escaped, offline and accessible portfolio files", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-portfolio-"));
  try {
    const digester = new NodeReleaseDigester();
    const renderer = new StaticHtmlCareerPortfolioRenderer(digester);
    const useCase = new BuildCareerPortfolio({ readValidated: async () => release }, renderer,
      new LocalCareerPortfolioRepository(root, digester), { now: () => new Date("2026-09-14T01:00:00.000Z") });
    const first = await useCase.execute({ releaseDirectory: "/release" });
    const second = await useCase.execute({ releaseDirectory: "/release" });
    const html = await readFile(join(first.directory, "index.html"), "utf8");
    assert.equal(first.reused, false);
    assert.equal(second.reused, true);
    assert.match(html, /Content-Security-Policy/);
    assert.match(html, /Skip to career overview/);
    assert.match(html, /role="img"/);
    assert.match(html, /Equivalent record list/);
    assert.match(html, /Evidence and provenance/);
    assert.match(html, /No evidence records were included/);
    assert.match(html, /@media print/);
    assert.doesNotMatch(html, /<script|<img src=x/);
    assert.doesNotMatch(html, /https?:\/\//);
    assert.match(html, /&lt;script&gt;/);
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(first.projection.files["index.html"], renderer.render(release).files["index.html"]);
    await assert.rejects(() => new BuildCareerPortfolio({ readValidated: async () => release }, renderer,
      new LocalCareerPortfolioRepository(root, digester), { now: () => new Date("2026-10-14T00:00:00.000Z") })
      .execute({ releaseDirectory: "/release" }), /authorisation has expired/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

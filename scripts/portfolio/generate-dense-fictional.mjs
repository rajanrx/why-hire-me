import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { NodeReleaseDigester } from "../../dist/adapters/publication/node-release-digester.js";
import { StaticHtmlCareerPortfolioRenderer } from "../../dist/adapters/publication/static-html-career-portfolio-renderer.js";

const output = process.argv[2];
if (!output) { process.stderr.write("Usage: node scripts/portfolio/generate-dense-fictional.mjs <new-output-dir>\n"); process.exit(2); }
const types = ["Organisation", "Role", "Engagement", "Work", "Contribution",
  "Reported outcome", "Technology", "TechnologyUse", "Evidence"];
const items = Array.from({ length: 200 }, (_, index) => {
  const type = types[index % types.length], id = `FICTIONAL-${String(index).padStart(3, "0")}`;
  const inclusion = ["Work", "Contribution", "Reported outcome"].includes(type)
    ? { recordId: id, status: index % 7 === 0 ? "featured" : "supporting",
        rationale: "Fictional dense-graph presentation test", summarisedUnderRecordId: null } : null;
  return { id, type, name: `${type} ${index} · Fictional ${["harbour", "orchard", "ridge", "cedar"][index % 4]}`,
    summary: `Fictional, entity-specific context for ${type.toLowerCase()} ${index}; no real career claim.`,
    recordedAt: "2026-09-16T00:00:00.000Z", details: [], inclusion };
});
const relations = Array.from({ length: 400 }, (_, index) => ({ id: `FICTIONAL-REL-${index}`,
  subject: items[index % 200].id,
  object: items[(index * 47 + 17 + Math.floor(index / 200)) % 200].id,
  predicate: "fictional.explicit_test_relation" })).filter(relation => relation.subject !== relation.object);
while (relations.length < 400) {
  const i = relations.length;
  relations.push({ id: `FICTIONAL-REL-EXTRA-${i}`, subject: items[i % 200].id,
    object: items[(i + 31) % 200].id, predicate: "fictional.explicit_test_relation" });
}
const model = { schema: "why-hire-me.portfolio-display/v1",
  subjectDisplayName: "Fictional Dense Graph", purpose: "layout and interaction test",
  audience: "private", resumeLength: "complete", items, relations, links: [], assets: [],
  limitations: ["All nodes and relationships are fictional test data."],
  provenance: { mode: "local-prototype", packetId: "FICTIONAL-GRAPH-200-400",
    reviewedBy: "test fixture", reviewReference: "fictional fixture",
    validation: "partially-validated", status: "session-only", generatedAt: "2026-09-16T00:00:00.000Z" } };
const decisions = items.flatMap(item => item.inclusion ? [item.inclusion] : []);
const projection = new StaticHtmlCareerPortfolioRenderer(new NodeReleaseDigester())
  .renderDisplayModel(model, decisions);
await mkdir(resolve(output));
for (const [path, content] of Object.entries(projection.files))
  await writeFile(join(resolve(output), path), content);
await writeFile(join(resolve(output), "portfolio-manifest.json"), JSON.stringify(projection.manifest, null, 2) + "\n");
process.stdout.write(JSON.stringify({ output: resolve(output), nodes: items.length,
  edges: relations.length, digest: projection.manifest.projectionDigest }) + "\n");

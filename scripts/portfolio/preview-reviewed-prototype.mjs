import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, writeFile, copyFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { adaptReviewedPrototype } from "../../dist/adapters/publication/reviewed-prototype-display-adapter.js";
import { NodeReleaseDigester } from "../../dist/adapters/publication/node-release-digester.js";
import { StaticHtmlCareerPortfolioRenderer } from "../../dist/adapters/publication/static-html-career-portfolio-renderer.js";

const value = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
const packetPath = value("--packet"), outputArg = value("--output"), baselineArg = value("--baseline");
if (!packetPath || !outputArg || !baselineArg) {
  process.stderr.write("Usage: node scripts/portfolio/preview-reviewed-prototype.mjs --packet <reviewed-json> --baseline <approved-portfolio-dir> --output <new-candidate-dir>\n");
  process.exit(2);
}
const output = resolve(outputArg), baseline = resolve(baselineArg);
if (output === baseline || output.startsWith(baseline + "/") || baseline.startsWith(output + "/"))
  throw new Error("The candidate and baseline must be separate directories.");
const packet = JSON.parse(await readFile(resolve(packetPath), "utf8"));
const display = adaptReviewedPrototype(packet);
const prior = JSON.parse(await readFile(join(baseline, "generation-record.json"), "utf8"));
const priorIds = new Set((prior.preview?.carryForwardMap ?? []).map(item => item.baselineItemId));
const carried = new Set(packet.carryForwardMap.map(item => item.baselineItemId));
const missing = [...priorIds].filter(id => !carried.has(id));
if (missing.length) throw new Error(`The candidate packet omits ${missing.length} baseline carry-forward IDs: ${missing.slice(0, 8).join(", ")}`);
if ((await readdir(dirname(output))).includes(output.split("/").at(-1)))
  throw new Error(`Candidate output already exists: ${output}`);
const assetBytes = [];
for (const asset of packet.assets ?? []) {
  const source = resolve(asset.sourcePath), info = await lstat(source);
  if (!info.isFile() || info.isSymbolicLink()) throw new Error(`Unsafe asset source: ${source}`);
  const bytes = await readFile(source);
  assetBytes.push({ source, outputPath: asset.outputPath, bytes,
    sha256: createHash("sha256").update(bytes).digest("hex") });
}
const digester = new NodeReleaseDigester();
const projection = new StaticHtmlCareerPortfolioRenderer(digester)
  .renderDisplayModel(display, packet.inclusionDecisions);
await mkdir(output);
for (const [path, contents] of Object.entries(projection.files))
  await writeFile(join(output, path), contents, { flag: "wx" });
for (const asset of assetBytes) await copyFile(asset.source, join(output, asset.outputPath));
await writeFile(join(output, "portfolio-manifest.json"), JSON.stringify(projection.manifest, null, 2) + "\n", { flag: "wx" });
const generationRecord = {
  schemaVersion: "0.4", recordType: "CareerPortfolioGeneration",
  mode: "local-prototype", status: "preview",
  prototypeInput: { packetId: packet.packetId, validation: "partially-validated",
    status: "session-only", reviewAuthority: packet.review.reviewedBy,
    reviewReference: packet.review.reviewReference },
  priorProjection: { directory: baseline, baselineStatus: "inventoried" },
  preview: { outputPath: output, replacesExisting: false, resumeLength: packet.resumeLength,
    inclusionMap: packet.inclusionDecisions, technologyUseMap: packet.technologyUseMap,
    referenceLinkMap: packet.referenceLinkMap, carryForwardMap: packet.carryForwardMap,
    personalDisclosure: packet.review.disclosureChoices, approvedByPerson: false },
  projection: { renderer: "StaticHtmlCareerPortfolioRenderer", rendererVersion: projection.manifest.rendererVersion,
    label: "prototype", entryFile: "index.html", manifestFile: "portfolio-manifest.json",
    digest: projection.manifest.projectionDigest, assets: assetBytes.map(({ outputPath, bytes, sha256 }) =>
      ({ path: outputPath, bytes: bytes.byteLength, sha256 })) },
  verification: { passed: ["reviewed-packet-validation", "explicit-relationship-validation",
    "carry-forward-id-coverage", "asset-hashes"], failed: [],
    warnings: ["Browser visual graph, responsive, keyboard, and print checks are still required; this candidate is not ready."] },
  delivery: { local: true, uploaded: false, public: false },
};
await writeFile(join(output, "generation-record.json"), JSON.stringify(generationRecord, null, 2) + "\n", { flag: "wx" });
process.stdout.write(JSON.stringify({ output, portfolioId: projection.manifest.portfolioId,
  projectionDigest: projection.manifest.projectionDigest,
  items: display.items.length, reviewedRelationships: display.relations.length,
  status: "preview-unverified" }, null, 2) + "\n");

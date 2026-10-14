import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, writeFile, copyFile, readdir, rename, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { adaptReviewedPrototype } from "../../dist/adapters/publication/reviewed-prototype-display-adapter.js";
import { NodeReleaseDigester } from "../../dist/adapters/publication/node-release-digester.js";
import { careerPortfolioRenderer } from "../../dist/adapters/publication/career-portfolio-renderers.js";
import { invalidCarryForwardLocators } from "../../dist/adapters/publication/prototype-carry-forward-validator.js";

const usage = "Usage: node scripts/portfolio/preview-reviewed-prototype.mjs --packet <reviewed-json> [--baseline <approved-portfolio-dir>] --output <new-candidate-dir> [--template <editorial-record|material-profile>]\n";
let options;
try {
  ({ values: options } = parseArgs({ args: process.argv.slice(2).filter(arg => arg !== "--"), options: {
    packet: { type: "string" }, baseline: { type: "string" }, output: { type: "string" },
    template: { type: "string", default: "editorial-record" },
  } }));
} catch (error) {
  process.stderr.write(`${error.message}\n${usage}`);
  process.exit(2);
}
const { packet: packetPath, output: outputArg, baseline: baselineArg, template } = options;
if (!packetPath || !outputArg) {
  process.stderr.write(usage);
  process.exit(2);
}
const output = resolve(outputArg), baseline = baselineArg ? resolve(baselineArg) : null;
if (baseline && (output === baseline || output.startsWith(baseline + "/") || baseline.startsWith(output + "/")))
  throw new Error("The candidate and baseline must be separate directories.");
const packet = JSON.parse(await readFile(resolve(packetPath), "utf8"));
const display = adaptReviewedPrototype(packet);
// A first build has no approved baseline; later builds must carry every baseline item forward.
const prior = baseline ? JSON.parse(await readFile(join(baseline, "generation-record.json"), "utf8")) : {};
const priorIds = new Set((prior.preview?.carryForwardMap ?? []).map(item => item.baselineItemId));
const carried = new Set(packet.carryForwardMap.map(item => item.baselineItemId));
const missing = [...priorIds].filter(id => !carried.has(id));
if (missing.length) throw new Error(`The candidate packet omits ${missing.length} baseline carry-forward IDs: ${missing.slice(0, 8).join(", ")}`);
const assetBytes = [];
for (const asset of packet.assets ?? []) {
  // Relative asset paths belong to the packet, so the same packet builds the same bundle from any directory.
  const source = resolve(dirname(resolve(packetPath)), asset.sourcePath), info = await lstat(source);
  if (!info.isFile() || info.isSymbolicLink()) throw new Error(`Unsafe asset source: ${source}`);
  const bytes = await readFile(source);
  assetBytes.push({ source, outputPath: asset.outputPath, bytes,
    sha256: createHash("sha256").update(bytes).digest("hex") });
}
const digester = new NodeReleaseDigester();
const renderer = careerPortfolioRenderer(template, digester);
const projection = renderer.renderDisplayModel(display, packet.inclusionDecisions);
const candidateOutputs = new Map(Object.entries(projection.files));
for (const asset of assetBytes) candidateOutputs.set(asset.outputPath, asset.bytes);
candidateOutputs.set("portfolio-manifest.json", JSON.stringify(projection.manifest));
const invalidLocators = invalidCarryForwardLocators(packet.carryForwardMap, candidateOutputs);
if (invalidLocators.length) throw new Error(`Carry-forward map contains ${invalidLocators.length} locator(s) that do not resolve to candidate content: ${invalidLocators.slice(0, 8).map(item => `${item.baselineItemId} -> ${item.newLocator}`).join(", ")}`);
const stage = `${output}.partial-${process.pid}`;
await rm(stage, { recursive: true, force: true });
await mkdir(stage, { recursive: true });
for (const [path, contents] of Object.entries(projection.files))
  await writeFile(join(stage, path), contents, { flag: "wx" });
for (const asset of assetBytes) await copyFile(asset.source, join(stage, asset.outputPath));
await writeFile(join(stage, "portfolio-manifest.json"), JSON.stringify(projection.manifest, null, 2) + "\n", { flag: "wx" });
const generationRecord = {
  schemaVersion: "0.4", recordType: "CareerPortfolioGeneration",
  mode: "local-prototype", status: "preview",
  prototypeInput: { packetId: packet.packetId, validation: "partially-validated",
    status: "session-only", reviewAuthority: packet.review.reviewedBy,
    reviewReference: packet.review.reviewReference },
  priorProjection: baseline ? { directory: baseline, baselineStatus: "inventoried" } : { directory: null, baselineStatus: "first-build" },
  preview: { outputPath: output, replacesExisting: false, resumeLength: packet.resumeLength,
    inclusionMap: packet.inclusionDecisions, technologyUseMap: packet.technologyUseMap,
    referenceLinkMap: packet.referenceLinkMap, carryForwardMap: packet.carryForwardMap,
    personalDisclosure: packet.review.disclosureChoices, approvedByPerson: false },
  projection: { renderer: renderer.constructor.name, template, rendererVersion: projection.manifest.rendererVersion,
    label: "prototype", entryFile: "index.html", manifestFile: "portfolio-manifest.json",
    digest: projection.manifest.projectionDigest, assets: assetBytes.map(({ outputPath, bytes, sha256 }) =>
      ({ path: outputPath, bytes: bytes.byteLength, sha256 })) },
  verification: { passed: ["reviewed-packet-validation", "explicit-relationship-validation",
    "carry-forward-id-coverage", "carry-forward-locator-target-resolution", "asset-hashes"], failed: [],
    warnings: ["Browser visual graph, responsive, keyboard, and print checks are still required; this candidate is not ready."] },
  delivery: { local: true, uploaded: false, public: false },
};
await writeFile(join(stage, "generation-record.json"), JSON.stringify(generationRecord, null, 2) + "\n", { flag: "wx" });
// Re-running with the same packet is a no-op; a different build never overwrites an existing candidate.
let state = "created";
if ((await readdir(dirname(output))).includes(output.split("/").at(-1))) {
  const same = async () => {
    const [mine, theirs] = [(await readdir(stage)).sort(), (await readdir(output)).sort()];
    if (mine.join() !== theirs.join()) return false;
    // The generation record holds machine paths; the bundle bytes decide whether this is the same build.
    for (const name of mine) if (name !== "generation-record.json" &&
      !(await readFile(join(stage, name))).equals(await readFile(join(output, name)))) return false;
    return true;
  };
  const identical = await same();
  if (identical) await copyFile(join(stage, "generation-record.json"), join(output, "generation-record.json"));
  await rm(stage, { recursive: true, force: true });
  if (!identical) throw new Error(`Candidate output already exists with different content: ${output}`);
  state = "unchanged";
} else await rename(stage, output);
process.stdout.write(JSON.stringify({ output, portfolioId: projection.manifest.portfolioId,
  projectionDigest: projection.manifest.projectionDigest,
  items: display.items.length, reviewedRelationships: display.relations.length,
  status: "preview-unverified", state }, null, 2) + "\n");

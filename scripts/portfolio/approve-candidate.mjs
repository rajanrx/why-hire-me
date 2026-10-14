import { cp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { parseArgs } from "node:util";

const usage = "Usage: node scripts/portfolio/approve-candidate.mjs --candidate <preview-dir> --target <published-dir> --approved-by <who and when> [--record <generation-record.json>] [--note <verification note>]\n";
let options;
try {
  ({ values: options } = parseArgs({ args: process.argv.slice(2).filter(arg => arg !== "--"), options: {
    candidate: { type: "string" }, target: { type: "string" }, "approved-by": { type: "string" },
    record: { type: "string" }, note: { type: "string", multiple: true } } }));
} catch (error) {
  process.stderr.write(`${error.message}\n${usage}`);
  process.exit(2);
}
if (!options.candidate || !options.target || !options["approved-by"]) {
  process.stderr.write(usage);
  process.exit(2);
}

const candidate = resolve(options.candidate), target = resolve(options.target);
// The record lives beside the published directory by default, so the directory holds only servable files.
const recordPath = resolve(options.record ?? join(dirname(target), "generation-record.json"));
const record = JSON.parse(await readFile(join(candidate, "generation-record.json"), "utf8"));
if (record.recordType !== "CareerPortfolioGeneration" || record.status !== "preview")
  throw new Error("The candidate has no preview generation record; build it with preview-reviewed-prototype first.");

const files = (await readdir(candidate)).filter(name => name !== "generation-record.json").sort();
// Only ever replace an empty directory or an earlier portfolio, never an unrelated folder.
const existing = await readdir(target).catch(() => []);
if (existing.length && !existing.includes("portfolio-manifest.json"))
  throw new Error(`Refusing to replace ${target}: it is not empty and holds no portfolio-manifest.json.`);
await rm(target, { recursive: true, force: true });
for (const name of files) await cp(join(candidate, name), join(target, name), { recursive: true });

// Paths are recorded relative to the record so the same approval reads the same on any machine.
const base = dirname(recordPath);
record.status = "approved";
record.preview = { ...record.preview, outputPath: relative(base, target) || ".", approvedByPerson: true, approvedBy: options["approved-by"] };
if (record.priorProjection?.directory) record.priorProjection.directory = relative(base, resolve(record.priorProjection.directory)) || ".";
if (options.note?.length) record.verification = { ...record.verification, warnings: options.note };
await writeFile(recordPath, JSON.stringify(record, null, 2) + "\n");
process.stdout.write(`${JSON.stringify({ target, record: recordPath, files, digest: record.projection.digest })}\n`);

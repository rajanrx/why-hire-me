import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { parseArgs } from "node:util";

const usage = "Usage: node scripts/portfolio/verify-hosted.mjs --portfolio <published-dir> --url <https://site.example> [--output <publication-record.json>] [--destination <label>]\n";
let options;
try {
  ({ values: options } = parseArgs({ args: process.argv.slice(2).filter(arg => arg !== "--"), options: {
    portfolio: { type: "string" }, url: { type: "string" }, output: { type: "string" }, destination: { type: "string" } } }));
} catch (error) {
  process.stderr.write(`${error.message}\n${usage}`);
  process.exit(2);
}
if (!options.portfolio || !options.url) {
  process.stderr.write(usage);
  process.exit(2);
}
const base = new URL(options.url);
if (base.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(base.hostname))
  throw new Error("Verify a hosted site over https.");

const MEDIA = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".pdf": "application/pdf", ".mp3": "audio/mpeg", ".m4a": "audio/mp4" };
const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");
const directory = resolve(options.portfolio);
const manifest = JSON.parse(await readFile(join(directory, "portfolio-manifest.json"), "utf8"));
const files = [];
for (const name of (await readdir(directory)).sort()) {
  const local = await readFile(join(directory, name));
  const response = await fetch(new URL(name === "index.html" ? "./" : name, base), { headers: { "Cache-Control": "no-cache" } });
  const remote = Buffer.from(await response.arrayBuffer());
  files.push({ path: name, mediaType: MEDIA[extname(name)] ?? "application/octet-stream", size: local.byteLength,
    sha256: sha256(local), status: response.status, match: response.ok && sha256(remote) === sha256(local) });
}
const verified = files.every(file => file.match);
const record = {
  schemaVersion: "0.2", recordType: "HostedCareerPortfolioVerification", status: verified ? "verified" : "mismatch",
  input: { projectionId: manifest.portfolioId, projectionDigest: manifest.projectionDigest, template: manifest.template ?? "editorial-record",
    manifestDigest: sha256(await readFile(join(directory, "portfolio-manifest.json"))), files },
  destination: { url: base.href, label: options.destination ?? null },
  result: { equivalence: verified ? "verified" : "mismatch", verifiedAt: new Date().toISOString(),
    warnings: ["Public files may be downloaded, cached, indexed, archived, or redistributed.",
      "Rollback cannot recall copies already downloaded or cached."] },
};
if (options.output) await writeFile(resolve(options.output), JSON.stringify(record, null, 2) + "\n");
process.stdout.write(`${JSON.stringify({ status: record.status, mismatched: files.filter(file => !file.match).map(file => file.path) })}\n`);
process.exit(verified ? 0 : 1);

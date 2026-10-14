import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { applyPacketAmendments } from "../../dist/adapters/publication/reviewed-packet-amendments.js";
import { adaptReviewedPrototype } from "../../dist/adapters/publication/reviewed-prototype-display-adapter.js";

const usage = "Usage: node scripts/portfolio/amend-reviewed-packet.mjs --packet <reviewed-packet.json> --amendments <amendments.json> --output <next-packet.json>\n";
let options;
try {
  ({ values: options } = parseArgs({ args: process.argv.slice(2).filter(arg => arg !== "--"), options: {
    packet: { type: "string" }, amendments: { type: "string" }, output: { type: "string" } } }));
} catch (error) {
  process.stderr.write(`${error.message}\n${usage}`);
  process.exit(2);
}
if (!options.packet || !options.amendments || !options.output) {
  process.stderr.write(usage);
  process.exit(2);
}
const read = async path => JSON.parse(await readFile(resolve(path), "utf8"));
const amended = applyPacketAmendments(await read(options.packet), await read(options.amendments));
adaptReviewedPrototype(amended); // the same validation the portfolio build applies
const text = JSON.stringify(amended, null, 2) + "\n";
const output = resolve(options.output);
const existing = await readFile(output, "utf8").catch(() => null);
if (existing !== null && existing !== text) throw new Error(`${output} already exists with different content.`);
if (existing === null) await writeFile(output, text);
process.stdout.write(`${JSON.stringify({ output, packetId: amended.packetId, items: amended.items.length,
  relations: amended.relations.length, state: existing === null ? "created" : "unchanged" })}\n`);

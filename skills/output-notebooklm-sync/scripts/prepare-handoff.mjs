#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

function usage() {
  return "Usage: prepare-handoff.mjs --portfolio <portfolio.json> --output <directory> [--title <source title>]";
}

function parseArgs(argv) {
  const args = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!flag?.startsWith("--") || value === undefined) throw new Error(usage());
    args.set(flag, value);
  }
  if (!args.get("--portfolio") || !args.get("--output")) throw new Error(usage());
  return args;
}

function digest(contents) {
  return createHash("sha256").update(contents).digest("hex");
}

function validatePortfolio(contents) {
  let parsed;
  try {
    parsed = JSON.parse(contents.toString("utf8"));
  } catch {
    throw new Error("The portfolio source is not valid JSON.");
  }
  if (typeof parsed.schema !== "string" || !parsed.schema.startsWith("why-hire-me.portfolio-data/")) {
    throw new Error("The source is not a Why Hire Me portfolio projection.");
  }
  const display = parsed.displayModel;
  if (!display || !Array.isArray(display.items) || !Array.isArray(display.relations) || !Array.isArray(display.links)) {
    throw new Error("The portfolio projection must contain complete items, relations, and links arrays.");
  }
  for (const link of display.links) {
    if (typeof link.id !== "string" || typeof link.label !== "string" || typeof link.url !== "string") {
      throw new Error("Every approved reference must have id, label, and url strings.");
    }
    const url = new URL(link.url);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error(`Approved reference ${link.id} does not use HTTP(S).`);
    }
  }
  return { parsed, display };
}

function referenceIndex(links) {
  const lines = [
    "# Approved public career references",
    "",
    "These references come from the disclosure-approved portfolio projection. A listed URL is not evidence that NotebookLM successfully imported the page.",
    "",
  ];
  if (links.length === 0) lines.push("No approved public references are present in this projection.", "");
  for (const link of links) {
    lines.push(`- ${link.label}`, `  - URL: ${link.url}`, `  - Reference ID: ${link.id}`);
    if (typeof link.sourceStatus === "string") lines.push(`  - Status: ${link.sourceStatus}`);
    if (typeof link.targetRecordId === "string") lines.push(`  - Target record: ${link.targetRecordId}`);
    lines.push("");
  }
  return Buffer.from(`${lines.join("\n").trimEnd()}\n`, "utf8");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sourcePath = resolve(args.get("--portfolio"));
  const output = resolve(args.get("--output"));
  const sourceTitle = args.get("--title") ?? "Complete Reviewed Career Knowledge (portfolio.json)";
  const portfolio = await readFile(sourcePath);
  const { parsed, display } = validatePortfolio(portfolio);
  const references = referenceIndex(display.links);
  const primaryDigest = digest(portfolio);
  const files = [
    { path: "portfolio.json", role: "primary-projection", mediaType: "application/json", bytes: portfolio.length, sha256: primaryDigest },
    { path: "portfolio-json.txt", role: "format-fallback", alternativeFor: "portfolio.json", mediaType: "text/plain", bytes: portfolio.length, sha256: primaryDigest },
    { path: "approved-reference-sources.md", role: "approved-reference-index", mediaType: "text/markdown", bytes: references.length, sha256: digest(references) },
  ];
  const manifest = {
    schema: "why-hire-me.notebooklm-handoff/v0.1",
    sourceTitle,
    sourceFile: basename(sourcePath),
    portfolioSchema: parsed.schema,
    buildMarker: parsed.buildMarker ?? null,
    counts: { items: display.items.length, relations: display.relations.length, links: display.links.length },
    instructions: {
      primary: "Upload portfolio.json as the complete career knowledge source.",
      fallback: "If JSON is unsupported, upload portfolio-json.txt instead. Never upload both.",
      supplements: "A resume or rendered page is optional supplementary material, never a replacement for the primary source.",
      sharing: "Preserve the notebook's existing sharing state.",
    },
    files,
  };

  await mkdir(output, { recursive: false });
  await writeFile(resolve(output, "portfolio.json"), portfolio, { flag: "wx", mode: 0o600 });
  await writeFile(resolve(output, "portfolio-json.txt"), portfolio, { flag: "wx", mode: 0o600 });
  await writeFile(resolve(output, "approved-reference-sources.md"), references, { flag: "wx", mode: 0o600 });
  await writeFile(resolve(output, "notebooklm-handoff.json"), `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx", mode: 0o600 });
  process.stdout.write(`${resolve(output, "notebooklm-handoff.json")}\n`);
}

await main();

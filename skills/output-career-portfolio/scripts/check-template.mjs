import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve, join, basename } from "node:path";

function argument(name) {
  const index = process.argv.indexOf(name);
  return index < 0 ? null : process.argv[index + 1] || null;
}

const baseline = argument("--baseline");
const candidate = argument("--candidate");
const revisionPath = argument("--revision");
const previewMode = process.argv.includes("--preview");
const failed = [];
const passed = [];
const warnings = [];

if (!baseline || !candidate) {
  process.stderr.write("Usage: node check-template.mjs --baseline <directory> --candidate <directory> [--preview | --revision <approved-json>]\n");
  process.exit(2);
}

async function file(directory, name) {
  return readFile(join(resolve(directory), name));
}

function assets(html) {
  const names = new Set();
  const patterns = [
    /<link\b[^>]*\bhref=["']([^"']+\.css(?:\?[^"']*)?)["'][^>]*>/gi,
    /<script\b[^>]*\bsrc=["']([^"']+\.js(?:\?[^"']*)?)["'][^>]*>/gi,
  ];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const name = match[1].split("?")[0];
      if (!/^[a-zA-Z0-9._-]+$/.test(name)) failed.push(`Unsafe or remote template asset: ${match[1]}`);
      else if (basename(name) !== "portfolio-data.js") names.add(name);
    }
  }
  return names;
}

function shell(html, label) {
  if (!/<main\b/i.test(html)) failed.push(`${label}: missing main landmark`);
  if (!/class=["'][^"']*\bprofile\b/i.test(html)) failed.push(`${label}: missing profile hierarchy`);
  if (!/href=["']#(?:content|main)["']/i.test(html)) failed.push(`${label}: missing skip target`);
  for (const lens of ["Experience", "Expertise", "Graph", "Evidence"]) {
    if (!new RegExp(`<button[^>]*role=["']tab["'][^>]*>${lens}<\\/button>`, "i").test(html) &&
        !new RegExp(`<button[^>]*data-tab=["'][^"']+["'][^>]*>${lens}<\\/button>`, "i").test(html)) {
      failed.push(`${label}: missing ${lens} tab`);
    }
  }
  if (!/id=["'](?:graph-list|relationship-list)["']/i.test(html))
    failed.push(`${label}: missing graph text equivalent`);
  if (!/id=["'](?:evidence-body|evidence-list)["']/i.test(html))
    failed.push(`${label}: missing evidence explorer`);
  if (!/<aside\b[^>]*(?:entity-drawer|drawer|entity explorer)/i.test(html))
    failed.push(`${label}: missing entity explorer`);
}

function contactNavigation(html) {
  const nav = html.match(/<nav\b[^>]*>([\s\S]*?)<\/nav>/gi)?.join("\n") || "";
  const contactLinks = [...nav.matchAll(/<a\b[^>]*href=["']([^"']*)["'][^>]*>[^<]*Contact[^<]*<\/a>/gi)];
  for (const [, target] of contactLinks) {
    if (!target || target === "#") {
      failed.push("candidate: Contact navigation has no destination");
      continue;
    }
    if (target === "#contact") {
      const section = html.match(/<section\b[^>]*id=["']contact["'][^>]*>([\s\S]*?)<\/section>/i)?.[1] || "";
      if (!section || !/<a\b[^>]*href=["'](?:mailto:|https:\/\/)[^"']+["']/i.test(section)) {
        failed.push("candidate: Contact navigation points to a section without an actionable contact link");
      }
    }
  }
}

try {
  const oldHtml = (await file(baseline, "index.html")).toString("utf8");
  const newHtml = (await file(candidate, "index.html")).toString("utf8");
  shell(oldHtml, "baseline");
  shell(newHtml, "candidate");
  contactNavigation(newHtml);
  const oldAssets = assets(oldHtml);
  const newAssets = assets(newHtml);
  const allAssets = new Set([...oldAssets, ...newAssets]);
  const changed = [];
  for (const name of allAssets) {
    let oldBytes;
    let newBytes;
    try { if (oldAssets.has(name)) oldBytes = await file(baseline, name); } catch { failed.push(`baseline asset unreadable: ${name}`); }
    try { if (newAssets.has(name)) newBytes = await file(candidate, name); } catch { failed.push(`candidate asset unreadable: ${name}`); }
    if (!oldBytes || !newBytes || !oldBytes.equals(newBytes)) changed.push(name);
  }

  let revision = null;
  if (revisionPath) revision = JSON.parse(await readFile(resolve(revisionPath), "utf8"));
  if (previewMode && revisionPath)
    failed.push("Use --preview for a candidate awaiting approval, or --revision for an approved replacement, not both");
  if (changed.length) {
    const approved = revision?.schema === "why-hire-me.template-revision/v1" &&
      revision?.approvedByPerson === true && Array.isArray(revision.changedAssets);
    const declared = approved ? revision.changedAssets : [];
    const declaredNames = new Set(declared.map((item) => item.path));
    if (previewMode && !revisionPath) {
      warnings.push(`Template revision approval required before replacement: ${changed.join(", ")}`);
      passed.push("Candidate asset changes inventoried for the exact side-by-side preview");
    } else if (!approved || declaredNames.size !== changed.length ||
        changed.some((name) => !declaredNames.has(name)) ||
        declared.some((item) => !changed.includes(item.path) || !item.rationale?.trim() || item.personApproved !== true)) {
      failed.push(`Unapproved template asset changes: ${changed.join(", ")}`);
    } else {
      passed.push(`Approved template revision covers: ${changed.join(", ")}`);
    }
  } else if (revision) {
    failed.push("Template revision was supplied but no visual or interaction asset changed");
  } else {
    passed.push("Visual and interaction assets match the approved baseline");
  }

  if (!failed.some((item) => item.includes("missing") || item.includes("Unsafe")))
    passed.push("Four-lens shell, graph equivalent, and entity explorer are present");
  const baselineAssetDigest = createHash("sha256").update(
    [...oldAssets].sort().join("\n"), "utf8",
  ).digest("hex");
  process.stdout.write(JSON.stringify({ status: failed.length ? "failed" : "passed", baselineAssetDigest,
    previewMode, pendingApproval: previewMode && changed.length > 0,
    changedAssets: changed.sort(), passed, warnings, failed }, null, 2) + "\n");
  if (failed.length) process.exitCode = 1;
} catch (error) {
  process.stdout.write(JSON.stringify({ status: "failed", previewMode, passed, warnings,
    failed: [...failed, String(error.message || error)] }, null, 2) + "\n");
  process.exitCode = 1;
}

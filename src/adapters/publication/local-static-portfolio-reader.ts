import { lstat, readFile, readdir } from "node:fs/promises";
import { basename, join } from "node:path";

import type { CareerPortfolioManifest } from "../../domains/publication/domain/career-portfolio.js";
import type { StaticPortfolioReader } from "../../domains/publication/ports/destination-publication-ports.js";
import type { ReleaseDigester } from "../../domains/publication/ports/knowledge-release-ports.js";

function isFileManifest(value: unknown): value is CareerPortfolioManifest["files"][number] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const file = value as Record<string, unknown>;
  return typeof file.path === "string" && ["index.html", "styles.css", "app.js", "portfolio.json"].includes(file.path) &&
    Number.isSafeInteger(file.bytes) && Number(file.bytes) >= 0 &&
    typeof file.sha256 === "string" && /^[a-f0-9]{64}$/.test(file.sha256);
}

function isInclusionDecision(value: unknown): boolean {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const decision = value as Record<string, unknown>;
  return typeof decision.recordId === "string" && decision.recordId.length > 0 &&
    ["featured", "supporting", "summarised", "excluded", "deferred"].includes(String(decision.status)) &&
    typeof decision.rationale === "string" && decision.rationale.trim().length > 0 &&
    (decision.summarisedUnderRecordId === null || typeof decision.summarisedUnderRecordId === "string");
}

export class LocalStaticPortfolioReader implements StaticPortfolioReader {
  public constructor(private readonly digester: ReleaseDigester, private readonly clock: { now(): Date }) {}
  public async validate(directory: string, expected: CareerPortfolioManifest) {
    const errors: string[] = [];
    if (expected === null || typeof expected !== "object" || expected.schema !== "why-hire-me.portfolio/v0.3" ||
      expected.entryPoint !== "index.html" || expected.rendererVersion !== "0.3.0" ||
      expected.buildMarker !== "why-hire-me.build/v1" ||
      !["one-page", "two-pages", "three-pages", "complete"].includes(expected.resumeLength) ||
      !/^release-[a-f0-9]{24}$/.test(expected.releaseId ?? "") ||
      !/^[a-f0-9]{64}$/.test(expected.releaseDigest ?? "") ||
      typeof expected.authorisationExpiresAt !== "string" || !Number.isFinite(Date.parse(expected.authorisationExpiresAt)) ||
      typeof expected.generatedAt !== "string" || !Number.isFinite(Date.parse(expected.generatedAt)) ||
      !Array.isArray(expected.limitations) || !expected.limitations.every((item) => typeof item === "string") ||
      !Array.isArray(expected.inclusionDecisions) || !expected.inclusionDecisions.every(isInclusionDecision) ||
      !Array.isArray(expected.files) || expected.files.length !== 4 || !expected.files.every(isFileManifest)) {
      return Object.freeze({ valid: false, errors: Object.freeze(["Portfolio manifest structure is invalid."]) });
    }
    const now = this.clock.now();
    if (Number.isNaN(now.getTime()) || Date.parse(expected.authorisationExpiresAt) <= now.getTime()) {
      errors.push("Portfolio authorisation has expired.");
    }
    const projectionDigest = this.digester.sha256(JSON.stringify({ schema: expected.schema,
      rendererVersion: expected.rendererVersion, buildMarker: expected.buildMarker,
      resumeLength: expected.resumeLength, releaseId: expected.releaseId,
      releaseDigest: expected.releaseDigest, authorisationExpiresAt: expected.authorisationExpiresAt,
      generatedAt: expected.generatedAt,
      entryPoint: expected.entryPoint, files: expected.files, limitations: expected.limitations,
      inclusionDecisions: expected.inclusionDecisions }));
    if (expected.projectionDigest !== projectionDigest || expected.portfolioId !== `portfolio-${projectionDigest.slice(0, 24)}`) {
      errors.push("Portfolio identity does not match its files and renderer.");
    }
    let stored: CareerPortfolioManifest | undefined;
    try { stored = JSON.parse(await readFile(join(directory, "portfolio-manifest.json"), "utf8")) as CareerPortfolioManifest; }
    catch { errors.push("portfolio-manifest.json is missing or invalid."); }
    if (stored?.portfolioId !== expected.portfolioId || stored?.projectionDigest !== expected.projectionDigest ||
      JSON.stringify(stored) !== JSON.stringify(expected)) {
      errors.push("Stored portfolio identity does not match the confirmed manifest.");
    }
    const entries = await readdir(directory).catch(() => [] as string[]);
    const expectedEntries = new Set(["index.html", "styles.css", "app.js", "portfolio.json", "portfolio-manifest.json"]);
    for (const entry of entries) if (!expectedEntries.has(entry)) errors.push(`Unexpected portfolio entry: ${entry}.`);
    const seen = new Set<string>();
    for (const file of expected.files) {
      if (basename(file.path) !== file.path || !["index.html", "styles.css", "app.js", "portfolio.json"].includes(file.path) || seen.has(file.path)) {
        errors.push(`Unsafe portfolio path: ${file.path}.`); continue;
      }
      seen.add(file.path);
      try {
        const info = await lstat(join(directory, file.path));
        if (!info.isFile() || info.isSymbolicLink()) { errors.push(`${file.path} is not a regular file.`); continue; }
        const content = await readFile(join(directory, file.path));
        if (content.byteLength !== file.bytes || this.digester.sha256(content) !== file.sha256) errors.push(`${file.path} differs from its manifest.`);
      } catch { errors.push(`${file.path} cannot be read.`); }
    }
    for (const name of ["index.html", "styles.css", "app.js", "portfolio.json"]) if (!seen.has(name)) errors.push(`Portfolio manifest omits ${name}.`);
    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

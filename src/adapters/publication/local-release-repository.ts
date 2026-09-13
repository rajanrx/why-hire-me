import { randomUUID } from "node:crypto";
import { lstat, mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

import {
  releasePayloadFiles,
  type KnowledgeReleaseBundle,
  type KnowledgeReleaseManifest,
  type ReleaseFileManifest,
  type ReleaseInputRecord,
  type ReleaseValidationResult,
} from "../../domains/publication/domain/knowledge-release.js";
import type { LocalReleaseRepository as LocalReleaseRepositoryPort, ReleaseDigester } from "../../domains/publication/ports/knowledge-release-ports.js";

function safeFile(path: string): boolean {
  return basename(path) === path && releasePayloadFiles.includes(path as (typeof releasePayloadFiles)[number]);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidManifestShape(value: Record<string, unknown>): boolean {
  const view = value.view;
  const subject = value.subject;
  const counts = value.counts;
  const compatibility = value.compatibility;
  return isRecord(view) && typeof view.id === "string" && view.id.length > 0 &&
    Number.isSafeInteger(view.version) && Number(view.version) > 0 &&
    typeof view.knowledgeSpaceId === "string" && view.knowledgeSpaceId.length > 0 &&
    typeof view.grantId === "string" && view.grantId.length > 0 &&
    typeof view.expiresAt === "string" && Number.isFinite(Date.parse(view.expiresAt)) &&
    isRecord(subject) && typeof subject.displayName === "string" && subject.displayName.trim().length > 0 &&
    typeof value.purpose === "string" && value.purpose.trim().length > 0 &&
    ["private", "restricted", "public"].includes(String(value.audience)) &&
    typeof value.createdAt === "string" && Number.isFinite(Date.parse(value.createdAt)) &&
    isRecord(counts) && releasePayloadFiles.every((name) => Number.isSafeInteger(counts[name]) && Number(counts[name]) >= 0) &&
    Array.isArray(value.limitations) && value.limitations.every((item) => typeof item === "string") &&
    isRecord(compatibility) && compatibility.minimumReader === "0.1.0";
}

export async function validateLocalRelease(directory: string, digester: ReleaseDigester): Promise<ReleaseValidationResult> {
  const errors: string[] = [];
  let manifest: KnowledgeReleaseManifest;
  try {
    const parsed: unknown = JSON.parse(await readFile(join(directory, "manifest.json"), "utf8"));
    if (!isRecord(parsed)) {
      return Object.freeze({ valid: false, errors: Object.freeze(["manifest.json must contain an object."]) });
    }
    manifest = parsed as unknown as KnowledgeReleaseManifest;
    if (!isValidManifestShape(parsed)) errors.push("Manifest schema is incomplete or invalid.");
  } catch {
    return Object.freeze({ valid: false, errors: Object.freeze(["manifest.json is missing or invalid JSON."]) });
  }
  if (manifest.schema !== "why-hire-me.release/v0.1") errors.push("Unsupported release schema.");
  if (!/^release-[a-f0-9]{24}$/.test(manifest.releaseId ?? "")) errors.push("Invalid release identity.");
  const entries = await readdir(directory).catch(() => [] as string[]);
  const expected = new Set(["manifest.json", ...releasePayloadFiles]);
  for (const entry of entries) if (!expected.has(entry)) errors.push(`Unexpected release entry: ${entry}.`);
  for (const expectedEntry of expected) if (!entries.includes(expectedEntry)) errors.push(`Missing release entry: ${expectedEntry}.`);

  const seen = new Set<string>();
  const recordIds = new Set<string>();
  const parsedRecords: ReleaseInputRecord[] = [];
  const expectedRecordType: Record<(typeof releasePayloadFiles)[number], ReleaseInputRecord["recordType"]> = {
    "entities.ndjson": "Entity", "claims.ndjson": "Claim", "evidence.ndjson": "Evidence",
    "activities.ndjson": "Activity", "aliases.ndjson": "Alias",
  };
  const rawManifestFiles: readonly unknown[] = Array.isArray(manifest.files) ? manifest.files : [];
  const manifestFiles: readonly ReleaseFileManifest[] = rawManifestFiles.filter(
    (value): value is ReleaseFileManifest => typeof value === "object" && value !== null &&
      typeof (value as { path?: unknown }).path === "string",
  );
  if (manifestFiles.length !== rawManifestFiles.length) errors.push("Manifest contains an invalid file entry.");
  for (const file of manifestFiles) {
    if (!safeFile(file.path) || seen.has(file.path)) { errors.push(`Unsafe or duplicate manifest path: ${String(file.path)}.`); continue; }
    if (file.mediaType !== "application/x-ndjson" || !Number.isSafeInteger(file.bytes) || file.bytes < 0 ||
      !Number.isSafeInteger(file.records) || file.records < 0 ||
      !/^[a-f0-9]{64}$/.test(file.sha256)) {
      errors.push(`${file.path} has invalid media type, size, count, or digest metadata.`); continue;
    }
    seen.add(file.path);
    const path = resolve(directory, file.path);
    try {
      const info = await lstat(path);
      if (!info.isFile() || info.isSymbolicLink()) { errors.push(`${file.path} is not a regular file.`); continue; }
      const bytes = await readFile(path);
      if (bytes.byteLength !== file.bytes) errors.push(`${file.path} byte count mismatch.`);
      if (digester.sha256(bytes) !== file.sha256) errors.push(`${file.path} digest mismatch.`);
      let content = "";
      try { content = new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
      catch { errors.push(`${file.path} is not valid UTF-8.`); continue; }
      const lines = content.length === 0 ? [] : content.endsWith("\n") ? content.slice(0, -1).split("\n") : content.split("\n");
      if (lines.length !== file.records) errors.push(`${file.path} record count mismatch.`);
      let previousId: string | undefined;
      for (const [index, line] of lines.entries()) {
        try {
          const record = JSON.parse(line) as ReleaseInputRecord;
          if (!record || typeof record !== "object" || record.recordType !== expectedRecordType[file.path]) {
            errors.push(`${file.path}:${index + 1} has the wrong record type.`); continue;
          }
          if (typeof record.id !== "string" || record.id.length === 0 || recordIds.has(record.id)) {
            errors.push(`${file.path}:${index + 1} has an empty or duplicate record ID.`); continue;
          }
          if (previousId !== undefined && record.id <= previousId) {
            errors.push(`${file.path}:${index + 1} is not in stable ID order.`);
          }
          previousId = record.id;
          recordIds.add(record.id);
          if (record.schemaVersion !== "0.1" || record.status !== "active" ||
            typeof record.recordedAt !== "string" || !Number.isFinite(Date.parse(record.recordedAt)) ||
            typeof record.generatedBy !== "string" || record.generatedBy.length === 0 ||
            !(record.supersedes === null || typeof record.supersedes === "string")) {
            errors.push(`${record.id} has an invalid canonical record envelope.`);
          }
          if (record.knowledgeSpaceId !== manifest.view?.knowledgeSpaceId) errors.push(`${record.id} belongs to another knowledge space.`);
          if (!Array.isArray(record.policyLabels) || record.policyLabels.some((label) =>
            typeof label !== "string" || ["secret", "contains-secret"].includes(label.toLowerCase()))) {
            errors.push(`${record.id} has invalid or forbidden policy labels.`);
          }
          parsedRecords.push(record);
        } catch { errors.push(`${file.path}:${index + 1} is invalid JSON.`); }
      }
      if ((manifest.counts?.[file.path] ?? -1) !== file.records) errors.push(`${file.path} manifest count mismatch.`);
    } catch { errors.push(`${file.path} cannot be read.`); }
  }
  const admissionOutputs = new Map<string, ReadonlySet<string>>();
  for (const activity of parsedRecords.filter((record) => record.recordType === "Activity")) {
    const data = isRecord(activity.data) ? activity.data : undefined;
    if (data?.activityType !== "entity-admission" || !Array.isArray(data.outputIds) ||
      !data.outputIds.every((id) => typeof id === "string" && id.length > 0)) {
      errors.push(`${activity.id} is not a valid entity-admission activity.`);
      continue;
    }
    admissionOutputs.set(activity.id, new Set(data.outputIds));
  }
  for (const entity of parsedRecords.filter((record) => record.recordType === "Entity")) {
    const data = isRecord(entity.data) ? entity.data : undefined;
    if (typeof data?.entityType !== "string" || data.entityType.length === 0 || !isRecord(data.attributes) ||
      typeof data.attributes.displayName !== "string" || data.attributes.displayName.trim().length === 0) {
      errors.push(`${entity.id} has invalid entity data.`);
    }
    if (!admissionOutputs.get(entity.generatedBy)?.has(entity.id)) {
      errors.push(`${entity.id} refers to a missing or unrelated admission activity.`);
    }
  }
  for (const name of releasePayloadFiles) if (!seen.has(name)) errors.push(`Manifest omits ${name}.`);
  const identity = JSON.stringify({ schema: manifest.schema,
    view: manifest.view, subject: manifest.subject, purpose: manifest.purpose, audience: manifest.audience,
    createdAt: manifest.createdAt, files: manifestFiles, counts: manifest.counts,
    limitations: manifest.limitations, compatibility: manifest.compatibility });
  const expectedDigest = digester.sha256(identity);
  if (manifest.releaseDigest !== expectedDigest || manifest.releaseId !== `release-${expectedDigest.slice(0, 24)}`) {
    errors.push("Release identity does not match its payload manifest.");
  }
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors), manifest });
}

export class LocalReleaseRepository implements LocalReleaseRepositoryPort {
  public constructor(private readonly root: string, private readonly digester: ReleaseDigester) {}

  public async create(bundle: KnowledgeReleaseBundle) {
    await mkdir(this.root, { recursive: true, mode: 0o700 });
    const directory = join(this.root, bundle.manifest.releaseId);
    const existing = await validateLocalRelease(directory, this.digester);
    if (existing.valid && existing.manifest?.releaseDigest === bundle.manifest.releaseDigest) {
      return Object.freeze({ directory, manifest: existing.manifest, reused: true });
    }
    if (existing.manifest !== undefined) throw new Error(`Release directory already exists with different or invalid content: ${directory}`);
    const temporary = join(this.root, `.${bundle.manifest.releaseId}-${randomUUID()}.tmp`);
    await mkdir(temporary, { mode: 0o700 });
    try {
      for (const name of releasePayloadFiles) await writeFile(join(temporary, name), bundle.files[name], { mode: 0o600, flag: "wx" });
      await writeFile(join(temporary, "manifest.json"), `${JSON.stringify(bundle.manifest, null, 2)}\n`, { mode: 0o600, flag: "wx" });
      const validation = await validateLocalRelease(temporary, this.digester);
      if (!validation.valid) throw new Error(`Generated release failed validation: ${validation.errors.join(" ")}`);
      await rename(temporary, directory);
      return Object.freeze({ directory, manifest: bundle.manifest, reused: false });
    } catch (error: unknown) {
      await rm(temporary, { recursive: true, force: true });
      throw error;
    }
  }
}

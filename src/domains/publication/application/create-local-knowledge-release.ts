import {
  KnowledgeReleaseValidationError,
  releasePayloadFiles,
  type KnowledgeReleaseBundle,
  type KnowledgeReleaseManifest,
  type ReleaseInputRecord,
  type ReleaseViewInput,
} from "../domain/knowledge-release.js";
import type { LocalReleaseRepository, ReleaseDigester } from "../ports/knowledge-release-ports.js";

function ndjson(records: readonly ReleaseInputRecord[]): string {
  return records.length === 0 ? "" : `${records.map((record) => JSON.stringify(record)).join("\n")}\n`;
}

function compareText(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }

export class CreateLocalKnowledgeRelease {
  public constructor(
    private readonly repository: LocalReleaseRepository,
    private readonly digester: ReleaseDigester,
    private readonly clock: { now(): Date },
  ) {}

  public async execute(view: ReleaseViewInput) {
    const now = this.clock.now();
    const expiry = new Date(view.expiresAt);
    if (Number.isNaN(now.getTime()) || Number.isNaN(expiry.getTime()) || expiry.getTime() <= now.getTime()) {
      throw new KnowledgeReleaseValidationError("Authorised view is expired or has an invalid expiry.");
    }
    if (view.id.trim().length === 0 || view.grantId.trim().length === 0 || view.knowledgeSpaceId.trim().length === 0) {
      throw new KnowledgeReleaseValidationError("View, grant, and knowledge-space identities are required.");
    }
    for (const record of view.records) {
      if (record.knowledgeSpaceId !== view.knowledgeSpaceId) {
        throw new KnowledgeReleaseValidationError(`Record ${record.id} belongs to another knowledge space.`);
      }
      if (["secret", "contains-secret"].some((label) => record.policyLabels.map((item) => item.toLowerCase()).includes(label))) {
        throw new KnowledgeReleaseValidationError(`Record ${record.id} is labelled as secret.`);
      }
    }

    const grouped = new Map<string, ReleaseInputRecord[]>(releasePayloadFiles.map((name) => [name, []]));
    const family: Record<ReleaseInputRecord["recordType"], (typeof releasePayloadFiles)[number]> = {
      Entity: "entities.ndjson", Claim: "claims.ndjson", Evidence: "evidence.ndjson",
      Activity: "activities.ndjson", Alias: "aliases.ndjson",
    };
    for (const record of [...view.records].sort((a, b) => compareText(a.id, b.id))) {
      grouped.get(family[record.recordType])?.push(record);
    }
    const files = Object.fromEntries(releasePayloadFiles.map((name) => [name, ndjson(grouped.get(name) ?? [])])) as KnowledgeReleaseBundle["files"];
    const fileManifests = releasePayloadFiles.map((path) => {
      const content = files[path];
      return Object.freeze({ path, mediaType: "application/x-ndjson" as const,
        bytes: new TextEncoder().encode(content).byteLength, records: grouped.get(path)?.length ?? 0,
        sha256: this.digester.sha256(content) });
    });
    const counts = Object.fromEntries(fileManifests.map((file) => [file.path, file.records])) as KnowledgeReleaseManifest["counts"];
    const identityDocument = {
      schema: "why-hire-me.release/v0.1" as const,
      view: { id: view.id, version: view.version, knowledgeSpaceId: view.knowledgeSpaceId,
        grantId: view.grantId, expiresAt: expiry.toISOString() },
      subject: { displayName: view.subjectDisplayName }, purpose: view.purpose, audience: view.audience,
      createdAt: view.createdAt, files: fileManifests, counts,
      limitations: [...view.limitations], compatibility: { minimumReader: "0.1.0" as const },
    };
    const releaseDigest = this.digester.sha256(JSON.stringify(identityDocument));
    const releaseId = `release-${releaseDigest.slice(0, 24)}`;
    const manifest: KnowledgeReleaseManifest = Object.freeze({
      schema: "why-hire-me.release/v0.1", releaseId, releaseDigest,
      view: Object.freeze(identityDocument.view),
      subject: Object.freeze(identityDocument.subject), purpose: view.purpose,
      audience: view.audience, createdAt: view.createdAt,
      files: Object.freeze(fileManifests), counts: Object.freeze(counts),
      limitations: Object.freeze([...view.limitations]),
      compatibility: Object.freeze({ minimumReader: "0.1.0" as const }),
    });
    return this.repository.create(Object.freeze({ manifest, files }));
  }
}

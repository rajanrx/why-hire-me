import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { EnvironmentCredentialProvider } from "../../../adapters/publication/environment-credential-provider.js";
import { FirebaseHostingPublisher, type CommandRunner } from "../../../adapters/publication/firebase-hosting-publisher.js";
import { LocalCareerPortfolioRepository } from "../../../adapters/publication/local-career-portfolio-repository.js";
import { LocalStaticPortfolioReader } from "../../../adapters/publication/local-static-portfolio-reader.js";
import { NodeReleaseDigester } from "../../../adapters/publication/node-release-digester.js";
import { StaticHtmlCareerPortfolioRenderer } from "../../../adapters/publication/static-html-career-portfolio-renderer.js";
import type { ValidatedKnowledgeRelease } from "../domain/career-portfolio.js";
import type { StaticPortfolioPublicationRequest } from "../domain/destination-publication.js";
import type { KnowledgeReleaseManifest } from "../domain/knowledge-release.js";
import { PublishCareerPortfolio } from "./publish-career-portfolio.js";
import type { PublicationLedger } from "../ports/destination-publication-ports.js";

class MemoryLedger implements PublicationLedger {
  private readonly values = new Map<string, { readonly fingerprint: string; readonly result: import("../domain/destination-publication.js").StaticPortfolioPublicationResult }>();
  public async find(key: string) { return this.values.get(key); }
  public async save(key: string, fingerprint: string, result: import("../domain/destination-publication.js").StaticPortfolioPublicationResult) {
    this.values.set(key, { fingerprint, result });
  }
}

const clock = { now: () => new Date("2026-09-14T01:00:00.000Z") };

async function fixture(root: string) {
  const digester = new NodeReleaseDigester();
  const manifest = { schema: "why-hire-me.release/v0.1", releaseId: "release-0123456789abcdef01234567",
    releaseDigest: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    view: { id: "view", version: 1, knowledgeSpaceId: "profile", grantId: "grant", expiresAt: "2099-01-01T00:00:00.000Z" },
    subject: { displayName: "Ada" }, purpose: "portfolio", audience: "public",
    createdAt: "2026-09-14T00:00:00.000Z", files: [], counts: { "entities.ndjson": 0,
      "claims.ndjson": 0, "evidence.ndjson": 0, "activities.ndjson": 0, "aliases.ndjson": 0 },
    limitations: [], compatibility: { minimumReader: "0.1.0" } } satisfies KnowledgeReleaseManifest;
  const release: ValidatedKnowledgeRelease = { directory: "/release", manifest, records: [] };
  const projection = new StaticHtmlCareerPortfolioRenderer(digester).render(release);
  const stored = await new LocalCareerPortfolioRepository(root, digester).create(projection);
  return { digester, projection, directory: stored.directory };
}

test("publishes exact staged files without putting credentials in command arguments", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-publish-"));
  try {
    const { digester, projection, directory } = await fixture(root);
    const secret = "/private/service-account.json";
    let invocations = 0;
    const commands: CommandRunner = { run: async (command, args, options) => {
      invocations += 1;
      assert.equal(command, "firebase");
      assert.ok(args.includes("hosting:channel:deploy"));
      assert.ok(args.includes("career-v1"));
      assert.equal(args.some((arg) => arg.includes(secret)), false);
      assert.equal(options.environment.GOOGLE_APPLICATION_CREDENTIALS, secret);
      return { exitCode: 0, stdout: JSON.stringify({ result: { url: "https://career-v1--portfolio.web.app" } }), stderr: "" };
    } };
    const useCase = new PublishCareerPortfolio(new LocalStaticPortfolioReader(digester, clock),
      new EnvironmentCredentialProvider({ GOOGLE_APPLICATION_CREDENTIALS: secret }),
      new FirebaseHostingPublisher(commands, { observe: async () => true }, digester), new MemoryLedger(), digester);
    const request: StaticPortfolioPublicationRequest = { portfolioDirectory: directory,
      manifest: projection.manifest, destination: { provider: "firebase-hosting", projectId: "career-project",
        target: "portfolio", mode: "preview-channel", channel: "career-v1", expires: "7d",
        requestedVisibility: "public" }, credentialSource: "GOOGLE_APPLICATION_CREDENTIALS",
      idempotencyKey: "firebase-career-v1", confirmed: true };
    const result = await useCase.execute(request);
    assert.equal(invocations, 1);
    assert.equal(result.publication.state, "observed-public");
    assert.equal(result.publication.safeUrl, "https://career-v1--portfolio.web.app");
    const retry = await useCase.execute(request);
    assert.equal(retry.reused, true);
    assert.equal(invocations, 1);
    await assert.rejects(() => useCase.execute({ ...request,
      destination: { ...request.destination, channel: "career-v2" } }), /different publication request/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("fails before connector invocation without confirmation or credentials", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-publish-"));
  try {
    const { digester, projection, directory } = await fixture(root);
    const publisher = new FirebaseHostingPublisher({ run: async () => { throw new Error("must not run"); } },
      { observe: async () => false }, digester);
    const base: StaticPortfolioPublicationRequest = { portfolioDirectory: directory, manifest: projection.manifest,
      destination: { provider: "firebase-hosting", projectId: "project", target: "portfolio", mode: "live",
        requestedVisibility: "public" }, credentialSource: "GOOGLE_APPLICATION_CREDENTIALS",
      idempotencyKey: "publish-1", confirmed: false };
    await assert.rejects(() => new PublishCareerPortfolio(new LocalStaticPortfolioReader(digester, clock),
      new EnvironmentCredentialProvider({ GOOGLE_APPLICATION_CREDENTIALS: "/secret" }), publisher,
      new MemoryLedger(), digester).execute({ ...base, idempotencyKey: "publish-1" }), /confirmation/);
    await assert.rejects(() => new PublishCareerPortfolio(new LocalStaticPortfolioReader(digester, clock),
      new EnvironmentCredentialProvider({}), publisher, new MemoryLedger(), digester)
      .execute({ ...base, idempotencyKey: "publish-1", confirmed: true }), /unavailable/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("reports connector refusal without changing the local portfolio", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-publish-"));
  try {
    const { digester, projection, directory } = await fixture(root);
    const useCase = new PublishCareerPortfolio(new LocalStaticPortfolioReader(digester, clock),
      new EnvironmentCredentialProvider({ GOOGLE_APPLICATION_CREDENTIALS: "/secret" }),
      new FirebaseHostingPublisher({ run: async () => ({ exitCode: 1, stdout: "", stderr: "quota exceeded" }) },
        { observe: async () => false }, digester), new MemoryLedger(), digester);
    await assert.rejects(() => useCase.execute({ portfolioDirectory: directory, manifest: projection.manifest,
      destination: { provider: "firebase-hosting", projectId: "project", target: "portfolio", mode: "live",
        requestedVisibility: "public" }, credentialSource: "GOOGLE_APPLICATION_CREDENTIALS",
      idempotencyKey: "publish-failure", confirmed: true }), /failed/);
    assert.equal((await new LocalStaticPortfolioReader(digester, clock).validate(directory, projection.manifest)).valid, true);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("rejects semantic and structural portfolio manifest tampering", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-publish-"));
  try {
    const { digester, projection, directory } = await fixture(root);
    const manifestPath = join(directory, "portfolio-manifest.json");
    const tampered = { ...projection.manifest, releaseId: "release-aaaaaaaaaaaaaaaaaaaaaaaa" };
    await writeFile(manifestPath, `${JSON.stringify(tampered, null, 2)}\n`);
    const semantic = await new LocalStaticPortfolioReader(digester, clock).validate(directory, tampered);
    assert.equal(semantic.valid, false);
    assert.match(semantic.errors.join(" "), /identity/);

    const malformed = { ...projection.manifest, files: [null, null] } as unknown as typeof projection.manifest;
    const structural = await new LocalStaticPortfolioReader(digester, clock).validate(directory, malformed);
    assert.equal(structural.valid, false);
    assert.match(structural.errors.join(" "), /structure/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("rejects publication after the portfolio authorisation expires", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-publish-"));
  try {
    const { digester, projection, directory } = await fixture(root);
    const validation = await new LocalStaticPortfolioReader(digester,
      { now: () => new Date("2099-01-01T00:00:00.000Z") }).validate(directory, projection.manifest);
    assert.equal(validation.valid, false);
    assert.match(validation.errors.join(" "), /authorisation has expired/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

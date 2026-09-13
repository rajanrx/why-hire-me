import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { StaticPortfolioPublicationRequest, StaticPortfolioPublicationResult } from "../../domains/publication/domain/destination-publication.js";
import type { DestinationPublisher, ResolvedCredential } from "../../domains/publication/ports/destination-publication-ports.js";
import type { ReleaseDigester } from "../../domains/publication/ports/knowledge-release-ports.js";

export interface CommandResult { readonly exitCode: number; readonly stdout: string; readonly stderr: string }
export interface CommandRunner {
  run(command: string, args: readonly string[], options: { readonly cwd: string; readonly environment: Readonly<Record<string, string>> }): Promise<CommandResult>;
}
export interface PublicUrlObserver { observe(url: string): Promise<boolean> }

function findHostingUrl(value: unknown): string | null {
  if (typeof value === "string" && /^https:\/\/[a-zA-Z0-9.-]+\.(?:web\.app|firebaseapp\.com)(?:\/.*)?$/.test(value)) return value;
  if (Array.isArray(value)) for (const item of value) { const found = findHostingUrl(item); if (found) return found; }
  if (typeof value === "object" && value !== null) for (const item of Object.values(value)) { const found = findHostingUrl(item); if (found) return found; }
  return null;
}

export class FirebaseHostingPublisher implements DestinationPublisher {
  public constructor(private readonly commands: CommandRunner, private readonly observer: PublicUrlObserver,
    private readonly digester: ReleaseDigester) {}

  public async publish(request: StaticPortfolioPublicationRequest, credential: ResolvedCredential): Promise<StaticPortfolioPublicationResult> {
    const staging = await mkdtemp(join(tmpdir(), "why-hire-me-firebase-"));
    try {
      const publicRoot = join(staging, "public"); await mkdir(publicRoot, { mode: 0o700 });
      for (const file of request.manifest.files) {
        const content = await readFile(join(request.portfolioDirectory, file.path));
        if (content.byteLength !== file.bytes || this.digester.sha256(content) !== file.sha256) {
          throw new Error(`${file.path} changed after publication confirmation.`);
        }
        await writeFile(join(publicRoot, file.path), content, { mode: 0o600, flag: "wx" });
      }
      await writeFile(join(publicRoot, "portfolio-manifest.json"), `${JSON.stringify(request.manifest, null, 2)}\n`,
        { mode: 0o600, flag: "wx" });
      const config = { hosting: { site: request.destination.siteId, public: "public", cleanUrls: true,
        trailingSlash: false, headers: [{ source: "**", headers: [{ key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" }, { key: "X-Frame-Options", value: "DENY" }] }] } };
      await writeFile(join(staging, "firebase.json"), `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
      const common = ["--project", request.destination.projectId,
        "--config", join(staging, "firebase.json"), "--json", "--non-interactive"];
      const args = request.destination.mode === "preview-channel"
        ? ["hosting:channel:deploy", request.destination.channel!, ...(request.destination.expires ? ["--expires", request.destination.expires] : []), ...common]
        : ["deploy", "--only", "hosting", ...common];
      const environment: Record<string, string> = { GOOGLE_APPLICATION_CREDENTIALS: credential.secret,
        HOME: staging, TMPDIR: staging };
      if (process.env.PATH) environment.PATH = process.env.PATH;
      const result = await this.commands.run("firebase", args, { cwd: staging, environment });
      if (result.exitCode !== 0) throw new Error(`Firebase Hosting deployment failed with exit code ${result.exitCode}.`);
      let parsed: unknown; try { parsed = JSON.parse(result.stdout); } catch { parsed = {}; }
      const safeUrl = findHostingUrl(parsed);
      const observed = safeUrl === null ? false : await this.observer.observe(safeUrl);
      return Object.freeze({ provider: "firebase-hosting", projectId: request.destination.projectId,
        siteId: request.destination.siteId, mode: request.destination.mode,
        state: observed ? "observed-public" : safeUrl ? "deployed" : "visibility-unknown",
        safeUrl, observedVisibility: observed ? "public" : "unknown",
        portfolioDigest: request.manifest.projectionDigest,
        warnings: Object.freeze(["Firebase Hosting URLs are public; downloaded or cached copies cannot be recalled."]) });
    } finally { await rm(staging, { recursive: true, force: true }); }
  }
}

import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

import { SqliteCaptureRepository } from "../../adapters/persistence/sqlite/sqlite-capture-repository.js";
import { SqlitePersonProfileRepository } from "../../adapters/persistence/sqlite/sqlite-person-profile-repository.js";
import { LocalTextArtifactRepository } from "../../adapters/persistence/sqlite/local-text-artifact-repository.js";
import { ContentAddressedSnapshotRepository } from "../../adapters/snapshots/content-addressed-snapshot-repository.js";
import { LocalFileSourceReader } from "../../adapters/sources/local-file-source-reader.js";
import { LocalCapturedEvidenceReader } from "../../adapters/evidence/local-captured-evidence-reader.js";
import { Utf8TextExtractor } from "../../adapters/extractors/utf8-text-extractor.js";
import { CaptureSource } from "../../domains/evidence-acquisition/application/capture-source.js";
import type { CaptureRecord } from "../../domains/evidence-acquisition/domain/capture-record.js";
import { CreatePersonProfile } from "../../domains/person-knowledge/application/create-person-profile.js";
import type { PersonProfile } from "../../domains/person-knowledge/domain/person-profile.js";
import { ExtractEvidenceText } from "../../domains/knowledge-enrichment/application/extract-evidence-text.js";
import type { ExtractionAttempt } from "../../domains/knowledge-enrichment/domain/text-extraction.js";
import { SqliteCandidateStagingRepository } from "../../adapters/persistence/sqlite/sqlite-candidate-staging-repository.js";
import { StageEntityCandidate } from "../../domains/knowledge-enrichment/application/stage-entity-candidate.js";
import type { EntityCandidate, CandidateSubmission, GeneratorType, UncertaintyLevel } from "../../domains/knowledge-enrichment/domain/entity-candidate.js";
import { SqliteEntityAdmissionRepository } from "../../adapters/persistence/sqlite/sqlite-entity-admission-repository.js";
import { ReviewEntityCandidate } from "../../domains/person-knowledge/application/review-entity-candidate.js";
import type {
  AdmissionResult,
  AdmissionDisposition,
  ReviewerAuthority,
} from "../../domains/person-knowledge/domain/entity-admission.js";
import { createHash } from "node:crypto";
import { SqliteAuthorisedViewRepository } from "../../adapters/persistence/sqlite/sqlite-authorised-view-repository.js";
import { CreateAuthorisedView } from "../../domains/person-knowledge/application/create-authorised-view.js";
import type { DisclosureAudience } from "../../domains/person-knowledge/domain/authorised-view.js";
import { NodeReleaseDigester } from "../../adapters/publication/node-release-digester.js";
import { LocalReleaseRepository, validateLocalRelease } from "../../adapters/publication/local-release-repository.js";
import { CreateLocalKnowledgeRelease } from "../../domains/publication/application/create-local-knowledge-release.js";
import type { ReleaseInputRecord } from "../../domains/publication/domain/knowledge-release.js";
import { LocalKnowledgeReleaseReader } from "../../adapters/publication/local-knowledge-release-reader.js";
import { StaticHtmlCareerPortfolioRenderer } from "../../adapters/publication/static-html-career-portfolio-renderer.js";
import { LocalCareerPortfolioRepository } from "../../adapters/publication/local-career-portfolio-repository.js";
import { BuildCareerPortfolio } from "../../domains/publication/application/build-career-portfolio.js";
import { readFile } from "node:fs/promises";
import { EnvironmentCredentialProvider } from "../../adapters/publication/environment-credential-provider.js";
import { LocalStaticPortfolioReader } from "../../adapters/publication/local-static-portfolio-reader.js";
import { FirebaseHostingPublisher } from "../../adapters/publication/firebase-hosting-publisher.js";
import { NodeCommandRunner } from "../../adapters/publication/node-command-runner.js";
import { FetchPublicUrlObserver } from "../../adapters/publication/fetch-public-url-observer.js";
import { PublishCareerPortfolio } from "../../domains/publication/application/publish-career-portfolio.js";
import type { CareerPortfolioManifest } from "../../domains/publication/domain/career-portfolio.js";
import { resumeLengths, type ResumeLength } from "../../domains/publication/domain/career-portfolio.js";
import type { PortfolioInclusionDecision } from "../../domains/publication/domain/career-portfolio-selection.js";
import { LocalPublicationLedger } from "../../adapters/publication/local-publication-ledger.js";

export type CliResult =
  | {
      readonly kind: "career-portfolio-preview";
      readonly preview: Awaited<ReturnType<BuildCareerPortfolio["preview"]>>;
    }
  | {
      readonly kind: "profile-created";
      readonly profile: PersonProfile;
      readonly databasePath: string;
    }
  | {
      readonly kind: "source-captured";
      readonly capture: CaptureRecord;
      readonly databasePath: string;
      readonly snapshotRoot: string;
    }
  | {
      readonly kind: "text-extracted";
      readonly extraction: ExtractionAttempt;
      readonly databasePath: string;
      readonly derivedRoot: string;
    }
  | {
      readonly kind: "entity-candidate-staged";
      readonly candidate: EntityCandidate;
      readonly submission: CandidateSubmission;
      readonly reused: boolean;
      readonly databasePath: string;
    }
  | {
      readonly kind: "entity-candidate-reviewed";
      readonly admission: AdmissionResult;
      readonly databasePath: string;
    }
  | {
      readonly kind: "authorised-view-created";
      readonly view: import("../../domains/person-knowledge/domain/authorised-view.js").AuthorisedKnowledgeView;
      readonly reused: boolean;
      readonly databasePath: string;
    }
  | {
      readonly kind: "knowledge-release-created";
      readonly directory: string;
      readonly manifest: import("../../domains/publication/domain/knowledge-release.js").KnowledgeReleaseManifest;
      readonly reused: boolean;
    }
  | {
      readonly kind: "knowledge-release-validated";
      readonly directory: string;
      readonly validation: import("../../domains/publication/domain/knowledge-release.js").ReleaseValidationResult;
    }
  | {
      readonly kind: "career-portfolio-created";
      readonly directory: string;
      readonly manifest: import("../../domains/publication/domain/career-portfolio.js").CareerPortfolioManifest;
      readonly reused: boolean;
    }
  | {
      readonly kind: "career-portfolio-published";
      readonly publication: import("../../domains/publication/domain/destination-publication.js").StaticPortfolioPublicationResult;
      readonly reused: boolean;
    };

function option(args: readonly string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (value === undefined || value.startsWith("--")) {
    throw new Error(`Missing value for ${name}.`);
  }
  return value;
}

function requiredOption(args: readonly string[], name: string): string {
  const value = option(args, name);
  if (value === undefined) {
    throw new Error(`Missing ${name}.\n\n${usage()}`);
  }
  return value;
}

function localPaths(args: readonly string[], environment: NodeJS.ProcessEnv) {
  const home = environment.WHY_HIRE_ME_HOME ?? join(homedir(), ".why-hire-me");
  const databasePath = resolve(option(args, "--database") ?? join(home, "knowledge.db"));
  const snapshotRoot = resolve(option(args, "--snapshots") ?? join(dirname(databasePath), "snapshots"));
  const derivedRoot = resolve(option(args, "--derived") ?? join(dirname(databasePath), "derived"));
  const releaseRoot = resolve(option(args, "--releases") ?? join(dirname(databasePath), "releases"));
  const portfolioRoot = resolve(option(args, "--portfolios") ?? join(dirname(databasePath), "portfolios"));
  const publicationRoot = resolve(option(args, "--publication-ledger") ?? join(dirname(databasePath), "publication-ledger"));
  return { databasePath, snapshotRoot, derivedRoot, releaseRoot, portfolioRoot, publicationRoot };
}

export function usage(): string {
  return [
    "Usage:",
    "  why-hire-me profile create --name <display-name> [--database <path>]",
    "  why-hire-me source ingest --profile <profile-id> --file <path> [options]",
    "  why-hire-me evidence extract-text --profile <profile-id> --capture <capture-id> [options]",
    "  why-hire-me knowledge stage-entity --profile <id> --type <type> --name <name> --artifact <id> --lines <start:end> [options]",
    "  why-hire-me knowledge review-entity --profile <id> --candidate <id> --decision <accepted|rejected|deferred> [options]",
    "  why-hire-me knowledge create-view --profile <id> --purpose <text> --audience <private|restricted|public> --expires-at <RFC3339> --confirm [options]",
    "  why-hire-me release create --profile <id> --view <id> [--releases <path>]",
    "  why-hire-me release validate --path <release-directory>",
    "  why-hire-me portfolio preview --release <directory> --inclusion-map <json-file> [--resume-length <one-page|two-pages|three-pages|complete>]",
    "  why-hire-me portfolio build --release <directory> --inclusion-map <json-file> --confirm [--resume-length <one-page|two-pages|three-pages|complete>] [--portfolios <path>]",
    "  why-hire-me portfolio publish-firebase --portfolio <directory> --project <id> --site <id> --mode <preview-channel|live> --confirm-public [options]",
    "",
    "Environment:",
    "  WHY_HIRE_ME_HOME  Local data directory (default: ~/.why-hire-me)",
    "",
    "Source options:",
    "  --actor <id> --purpose <text> --idempotency-key <key> --correlation-id <id>",
    "  --database <path> --snapshots <path>",
  ].join("\n");
}

export async function runCli(
  args: readonly string[],
  environment: NodeJS.ProcessEnv = process.env,
): Promise<CliResult> {
  const { databasePath, snapshotRoot, derivedRoot, releaseRoot, portfolioRoot, publicationRoot } = localPaths(args, environment);

  if (args[0] === "profile" && args[1] === "create") {
    mkdirSync(dirname(databasePath), { recursive: true, mode: 0o700 });
    const displayName = requiredOption(args, "--name");
    const repository = new SqlitePersonProfileRepository(databasePath);
    try {
      const useCase = new CreatePersonProfile(
        repository,
        { generate: randomUUID },
        { now: () => new Date() },
      );
      const profile = await useCase.execute({ displayName });
      return Object.freeze({ kind: "profile-created", profile, databasePath });
    } finally {
      repository.close();
    }
  }

  if (args[0] === "source" && args[1] === "ingest") {
    const profileId = requiredOption(args, "--profile");
    const requestedLocator = requiredOption(args, "--file");
    const actorId = option(args, "--actor") ?? "local-user";
    const purpose = option(args, "--purpose") ?? "build-person-knowledge";
    const idempotencyKey = option(args, "--idempotency-key") ?? randomUUID();
    const correlationId = option(args, "--correlation-id") ?? randomUUID();
    mkdirSync(dirname(databasePath), { recursive: true, mode: 0o700 });
    mkdirSync(snapshotRoot, { recursive: true, mode: 0o700 });
    const profiles = new SqlitePersonProfileRepository(databasePath);
    const snapshots = new ContentAddressedSnapshotRepository(snapshotRoot);
    const captures = new SqliteCaptureRepository(databasePath, snapshots);
    try {
      const knowledgeSpaces = {
        exists: async (profileId: string) =>
          (await profiles.findById(profileId as PersonProfile["id"])) !== undefined,
      };
      const useCase = new CaptureSource(
        knowledgeSpaces,
        new LocalFileSourceReader(),
        snapshots,
        captures,
        { generate: randomUUID },
        { now: () => new Date() },
      );
      const capture = await useCase.execute({
        profileId,
        requestedLocator,
        actorId,
        purpose,
        permissionScope: `local-file:${requestedLocator}`,
        idempotencyKey,
        correlationId,
      });
      return Object.freeze({
        kind: "source-captured",
        capture,
        databasePath,
        snapshotRoot,
      });
    } finally {
      captures.close();
      profiles.close();
    }
  }

  if (args[0] === "evidence" && args[1] === "extract-text") {
    const profileId = requiredOption(args, "--profile");
    const captureId = requiredOption(args, "--capture");
    mkdirSync(derivedRoot, { recursive: true, mode: 0o700 });
    const snapshots = new ContentAddressedSnapshotRepository(snapshotRoot);
    const captures = new SqliteCaptureRepository(databasePath, snapshots);
    const artifacts = new LocalTextArtifactRepository(databasePath, derivedRoot);
    try {
      const extraction = await new ExtractEvidenceText(
        new LocalCapturedEvidenceReader(captures, snapshotRoot), [new Utf8TextExtractor()], artifacts,
        { generate: randomUUID }, { now: () => new Date() },
      ).execute({ profileId, captureId });
      return Object.freeze({ kind: "text-extracted", extraction, databasePath, derivedRoot });
    } finally { artifacts.close(); captures.close(); }
  }

  if (args[0] === "knowledge" && args[1] === "stage-entity") {
    const lineMatch=/^(\d+):(\d+)$/.exec(requiredOption(args,"--lines"));
    if(!lineMatch) throw new Error("--lines must use <start:end>.");
    const repository=new SqliteCandidateStagingRepository(databasePath,derivedRoot);
    try {
      const result=await new StageEntityCandidate(repository,repository,{generate:randomUUID},{now:()=>new Date()}).execute({
        profileId:requiredOption(args,"--profile"),entityType:requiredOption(args,"--type"),proposedName:requiredOption(args,"--name"),
        evidence:[{artifactId:requiredOption(args,"--artifact"),lineStart:Number(lineMatch[1]),lineEnd:Number(lineMatch[2]),relation:"supports"}],
        generator:{type:requiredOption(args,"--generator-type") as GeneratorType,id:requiredOption(args,"--generator"),version:requiredOption(args,"--generator-version"),
          ...(option(args,"--model") ? {modelIdentifier:option(args,"--model")!} : {})},
        uncertainty:{level:requiredOption(args,"--uncertainty") as UncertaintyLevel,rationale:requiredOption(args,"--uncertainty-rationale")},
        reviewRequirement:requiredOption(args,"--review") as "person-required"|"policy-required",
        policyLabels:requiredOption(args,"--policy").split(","),actorId:requiredOption(args,"--actor"),
        correlationId:requiredOption(args,"--correlation-id")});
      return Object.freeze({kind:"entity-candidate-staged",...result,databasePath});
    } finally { repository.close(); }
  }

  if (args[0] === "knowledge" && args[1] === "review-entity") {
    const repository = new SqliteEntityAdmissionRepository(databasePath);
    try {
      const admission = await new ReviewEntityCandidate(
        repository,
        repository,
        { generate: randomUUID },
        { now: () => new Date() },
      ).execute({
        profileId: requiredOption(args, "--profile"),
        candidateId: requiredOption(args, "--candidate"),
        disposition: requiredOption(args, "--decision") as AdmissionDisposition,
        reason: requiredOption(args, "--reason"),
        reviewerId: requiredOption(args, "--reviewer"),
        reviewerAuthority: requiredOption(args, "--reviewer-authority") as ReviewerAuthority,
        identityResolution: {
          duplicates: (option(args, "--duplicates") ?? "not-needed") as "not-needed" | "distinct",
          conflicts: (option(args, "--conflicts") ?? "not-needed") as "not-needed" | "resolved",
          ...(option(args, "--resolution-reason")
            ? { reason: option(args, "--resolution-reason")! }
            : {}),
        },
        correlationId: requiredOption(args, "--correlation-id"),
        idempotencyKey: requiredOption(args, "--idempotency-key"),
      });
      return Object.freeze({ kind: "entity-candidate-reviewed", admission, databasePath });
    } finally {
      repository.close();
    }
  }

  if (args[0] === "knowledge" && args[1] === "create-view") {
    const repository = new SqliteAuthorisedViewRepository(databasePath);
    try {
      const result = await new CreateAuthorisedView(repository, repository, { generate: randomUUID },
        { now: () => new Date() }, { sha256: (content) => createHash("sha256").update(content).digest("hex") }).execute({
          profileId: requiredOption(args, "--profile"), purpose: requiredOption(args, "--purpose"),
          audience: requiredOption(args, "--audience") as DisclosureAudience,
          audienceDescription: option(args, "--audience-description") ?? requiredOption(args, "--audience"),
          allowedPolicyLabels: (option(args, "--allow-policy") ?? "").split(",").map((value) => value.trim()).filter(Boolean),
          expiresAt: requiredOption(args, "--expires-at"), reviewerId: requiredOption(args, "--reviewer"),
          reviewerAuthority: "person", confirmed: args.includes("--confirm"),
          idempotencyKey: requiredOption(args, "--idempotency-key"),
        });
      return Object.freeze({ kind: "authorised-view-created", ...result, databasePath });
    } finally { repository.close(); }
  }

  if (args[0] === "release" && args[1] === "create") {
    const profileId = requiredOption(args, "--profile");
    const viewId = requiredOption(args, "--view");
    const views = new SqliteAuthorisedViewRepository(databasePath);
    try {
      const view = await views.findById(viewId, profileId);
      if (view === undefined) throw new Error("Authorised view is unavailable.");
      const digester = new NodeReleaseDigester();
      const result = await new CreateLocalKnowledgeRelease(new LocalReleaseRepository(releaseRoot, digester), digester,
        { now: () => new Date() }).execute({ id: view.id, version: view.version,
          knowledgeSpaceId: view.knowledgeSpaceId, subjectDisplayName: view.subject.displayName,
          purpose: view.grant.purpose, audience: view.grant.audience, grantId: view.grant.id,
          createdAt: view.createdAt, expiresAt: view.expiresAt,
          records: view.records as readonly ReleaseInputRecord[], limitations: view.limitations });
      return Object.freeze({ kind: "knowledge-release-created", ...result });
    } finally { views.close(); }
  }

  if (args[0] === "release" && args[1] === "validate") {
    const directory = resolve(requiredOption(args, "--path"));
    const validation = await validateLocalRelease(directory, new NodeReleaseDigester());
    return Object.freeze({ kind: "knowledge-release-validated", directory, validation });
  }

  if (args[0] === "portfolio" && (args[1] === "preview" || args[1] === "build")) {
    const releaseDirectory = resolve(requiredOption(args, "--release"));
    const inclusionPath = resolve(requiredOption(args, "--inclusion-map"));
    const inclusionDecisions = JSON.parse(await readFile(inclusionPath, "utf8")) as PortfolioInclusionDecision[];
    if (!Array.isArray(inclusionDecisions)) throw new Error("Portfolio inclusion map must be a JSON array.");
    const requestedResumeLength = option(args, "--resume-length") ?? "complete";
    if (!resumeLengths.includes(requestedResumeLength as ResumeLength)) {
      throw new Error(`Portfolio resume length must be one of: ${resumeLengths.join(", ")}.`);
    }
    const resumeLength = requestedResumeLength as ResumeLength;
    const digester = new NodeReleaseDigester();
    const useCase = new BuildCareerPortfolio(new LocalKnowledgeReleaseReader(digester),
      new StaticHtmlCareerPortfolioRenderer(digester), new LocalCareerPortfolioRepository(portfolioRoot, digester),
      { now: () => new Date() });
    if (args[1] === "preview") return Object.freeze({ kind: "career-portfolio-preview",
      preview: await useCase.preview({ releaseDirectory, inclusionDecisions, resumeLength }) });
    const result = await useCase.execute({ releaseDirectory, inclusionDecisions, resumeLength, approvedByPerson: args.includes("--confirm") });
    return Object.freeze({ kind: "career-portfolio-created", directory: result.directory,
      manifest: result.projection.manifest, reused: result.reused });
  }

  if (args[0] === "portfolio" && args[1] === "publish-firebase") {
    const portfolioDirectory = resolve(requiredOption(args, "--portfolio"));
    const manifest = JSON.parse(await readFile(join(portfolioDirectory, "portfolio-manifest.json"), "utf8")) as CareerPortfolioManifest;
    const mode = requiredOption(args, "--mode") as "preview-channel" | "live";
    const channel = option(args, "--channel");
    const expires = option(args, "--expires");
    const digester = new NodeReleaseDigester();
    const publication = await new PublishCareerPortfolio(new LocalStaticPortfolioReader(digester, { now: () => new Date() }),
      new EnvironmentCredentialProvider(environment),
      new FirebaseHostingPublisher(new NodeCommandRunner(), new FetchPublicUrlObserver(), digester),
      new LocalPublicationLedger(publicationRoot, digester), digester).execute({
        portfolioDirectory, manifest,
        destination: { provider: "firebase-hosting", projectId: requiredOption(args, "--project"),
          siteId: requiredOption(args, "--site"), mode, ...(channel ? { channel } : {}),
          ...(expires ? { expires } : {}), requestedVisibility: "public" },
        credentialSource: "GOOGLE_APPLICATION_CREDENTIALS", confirmed: args.includes("--confirm-public"),
        idempotencyKey: requiredOption(args, "--idempotency-key"),
      });
    return Object.freeze({ kind: "career-portfolio-published", ...publication });
  }

  throw new Error(usage());
}

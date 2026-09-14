import type { KnowledgeReleaseManifest, ReleaseInputRecord } from "./knowledge-release.js";
import type { PortfolioInclusionDecision } from "./career-portfolio-selection.js";

export interface ValidatedKnowledgeRelease {
  readonly directory: string;
  readonly manifest: KnowledgeReleaseManifest;
  readonly records: readonly ReleaseInputRecord[];
}

export interface CareerPortfolioManifest {
  readonly schema: "why-hire-me.portfolio/v0.2";
  readonly portfolioId: string;
  readonly projectionDigest: string;
  readonly rendererVersion: "0.2.0";
  readonly releaseId: string;
  readonly releaseDigest: string;
  readonly authorisationExpiresAt: string;
  readonly generatedAt: string;
  readonly entryPoint: "index.html";
  readonly files: readonly {
    readonly path: "index.html" | "styles.css" | "app.js" | "portfolio.json";
    readonly bytes: number;
    readonly sha256: string;
  }[];
  readonly limitations: readonly string[];
  readonly inclusionDecisions: readonly PortfolioInclusionDecision[];
}

export interface CareerPortfolioProjection {
  readonly manifest: CareerPortfolioManifest;
  readonly files: Readonly<Record<"index.html" | "styles.css" | "app.js" | "portfolio.json", string>>;
}

export class CareerPortfolioValidationError extends Error {
  public constructor(message: string) { super(message); this.name = "CareerPortfolioValidationError"; }
}

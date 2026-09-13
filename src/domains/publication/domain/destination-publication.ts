import type { CareerPortfolioManifest } from "./career-portfolio.js";

export interface StaticPortfolioPublicationRequest {
  readonly portfolioDirectory: string;
  readonly manifest: CareerPortfolioManifest;
  readonly destination: {
    readonly provider: "firebase-hosting";
    readonly projectId: string;
    readonly target: string;
    readonly mode: "preview-channel" | "live";
    readonly channel?: string;
    readonly expires?: string;
    readonly requestedVisibility: "public";
  };
  readonly credentialSource: "GOOGLE_APPLICATION_CREDENTIALS";
  readonly idempotencyKey: string;
  readonly confirmed: boolean;
}

export interface StaticPortfolioPublicationResult {
  readonly provider: "firebase-hosting";
  readonly projectId: string;
  readonly target: string;
  readonly mode: "preview-channel" | "live";
  readonly state: "accepted" | "deployed" | "observed-public" | "visibility-unknown" | "failed";
  readonly safeUrl: string | null;
  readonly observedVisibility: "public" | "unknown";
  readonly portfolioDigest: string;
  readonly warnings: readonly string[];
}

export class DestinationPublicationValidationError extends Error {
  public constructor(message: string) { super(message); this.name = "DestinationPublicationValidationError"; }
}

export class DestinationPublicationConflictError extends Error {
  public constructor(message: string) { super(message); this.name = "DestinationPublicationConflictError"; }
}

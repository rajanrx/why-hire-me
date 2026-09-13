import type { CareerPortfolioManifest } from "../domain/career-portfolio.js";
import type { StaticPortfolioPublicationRequest, StaticPortfolioPublicationResult } from "../domain/destination-publication.js";

export interface ResolvedCredential {
  readonly source: "GOOGLE_APPLICATION_CREDENTIALS";
  readonly secret: string;
}

export interface CredentialProvider {
  resolve(source: "GOOGLE_APPLICATION_CREDENTIALS"): Promise<ResolvedCredential | undefined>;
}

export interface StaticPortfolioReader {
  validate(directory: string, manifest: CareerPortfolioManifest): Promise<{ readonly valid: boolean; readonly errors: readonly string[] }>;
}

export interface DestinationPublisher {
  publish(request: StaticPortfolioPublicationRequest, credential: ResolvedCredential): Promise<StaticPortfolioPublicationResult>;
}

export interface PublicationLedger {
  find(idempotencyKey: string): Promise<{ readonly fingerprint: string; readonly result: StaticPortfolioPublicationResult } | undefined>;
  save(idempotencyKey: string, fingerprint: string, result: StaticPortfolioPublicationResult): Promise<void>;
}

export interface PublicationDigester { sha256(content: string): string }

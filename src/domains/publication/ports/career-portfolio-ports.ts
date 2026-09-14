import type { CareerPortfolioProjection, ValidatedKnowledgeRelease } from "../domain/career-portfolio.js";
import type { PortfolioInclusionDecision } from "../domain/career-portfolio-selection.js";

export interface KnowledgeReleaseReader {
  readValidated(directory: string): Promise<ValidatedKnowledgeRelease>;
}

export interface CareerPortfolioRenderer {
  render(release: ValidatedKnowledgeRelease, inclusionDecisions: readonly PortfolioInclusionDecision[]): CareerPortfolioProjection;
}

export interface CareerPortfolioRepository {
  create(projection: CareerPortfolioProjection): Promise<{
    readonly directory: string;
    readonly projection: CareerPortfolioProjection;
    readonly reused: boolean;
  }>;
}

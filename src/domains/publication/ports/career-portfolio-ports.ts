import type { CareerPortfolioProjection, ValidatedKnowledgeRelease } from "../domain/career-portfolio.js";

export interface KnowledgeReleaseReader {
  readValidated(directory: string): Promise<ValidatedKnowledgeRelease>;
}

export interface CareerPortfolioRenderer {
  render(release: ValidatedKnowledgeRelease): CareerPortfolioProjection;
}

export interface CareerPortfolioRepository {
  create(projection: CareerPortfolioProjection): Promise<{
    readonly directory: string;
    readonly projection: CareerPortfolioProjection;
    readonly reused: boolean;
  }>;
}

import type {
  CareerPortfolioRenderer,
  CareerPortfolioRepository,
  KnowledgeReleaseReader,
} from "../ports/career-portfolio-ports.js";
import { CareerPortfolioValidationError } from "../domain/career-portfolio.js";

export class BuildCareerPortfolio {
  public constructor(
    private readonly releases: KnowledgeReleaseReader,
    private readonly renderer: CareerPortfolioRenderer,
    private readonly portfolios: CareerPortfolioRepository,
    private readonly clock: { now(): Date },
  ) {}

  public async execute(input: { readonly releaseDirectory: string }) {
    const release = await this.releases.readValidated(input.releaseDirectory);
    const now = this.clock.now();
    const expiry = new Date(release.manifest.view.expiresAt);
    if (Number.isNaN(now.getTime()) || Number.isNaN(expiry.getTime()) || expiry.getTime() <= now.getTime()) {
      throw new CareerPortfolioValidationError("The release authorisation has expired.");
    }
    return this.portfolios.create(this.renderer.render(release));
  }
}

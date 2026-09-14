import type {
  CareerPortfolioRenderer,
  CareerPortfolioRepository,
  KnowledgeReleaseReader,
} from "../ports/career-portfolio-ports.js";
import { CareerPortfolioValidationError } from "../domain/career-portfolio.js";
import { authorisedPortfolioAchievements, reconcilePortfolioInclusion, type PortfolioInclusionDecision } from "../domain/career-portfolio-selection.js";

export class BuildCareerPortfolio {
  public constructor(
    private readonly releases: KnowledgeReleaseReader,
    private readonly renderer: CareerPortfolioRenderer,
    private readonly portfolios: CareerPortfolioRepository,
    private readonly clock: { now(): Date },
  ) {}

  private async prepare(releaseDirectory: string, inclusionDecisions: readonly PortfolioInclusionDecision[]) {
    const release = await this.releases.readValidated(releaseDirectory);
    const now = this.clock.now();
    const expiry = new Date(release.manifest.view.expiresAt);
    if (Number.isNaN(now.getTime()) || Number.isNaN(expiry.getTime()) || expiry.getTime() <= now.getTime()) {
      throw new CareerPortfolioValidationError("The release authorisation has expired.");
    }
    const achievements = authorisedPortfolioAchievements(release.records);
    const inclusion = reconcilePortfolioInclusion(achievements, inclusionDecisions);
    return Object.freeze({ release, achievements, inclusion });
  }

  public async preview(input: { readonly releaseDirectory: string; readonly inclusionDecisions: readonly PortfolioInclusionDecision[] }) {
    const prepared = await this.prepare(input.releaseDirectory, input.inclusionDecisions);
    const projectionManifest = prepared.inclusion.complete
      ? this.renderer.render(prepared.release, prepared.inclusion.decisions).manifest : null;
    return Object.freeze({ releaseId: prepared.release.manifest.releaseId, subject: prepared.release.manifest.subject,
      purpose: prepared.release.manifest.purpose, audience: prepared.release.manifest.audience,
      achievements: prepared.achievements, inclusion: prepared.inclusion,
      projectionManifest, warnings: Object.freeze([...prepared.release.manifest.limitations]), approvedByPerson: false });
  }

  public async execute(input: { readonly releaseDirectory: string; readonly inclusionDecisions: readonly PortfolioInclusionDecision[]; readonly approvedByPerson: boolean }) {
    const prepared = await this.prepare(input.releaseDirectory, input.inclusionDecisions);
    if (!input.approvedByPerson) throw new CareerPortfolioValidationError("The exact portfolio inclusion preview requires person approval.");
    if (!prepared.inclusion.complete) {
      const detail = [...prepared.inclusion.unresolvedRecordIds, ...prepared.inclusion.errors].join("; ");
      throw new CareerPortfolioValidationError(`Portfolio inclusion coverage is incomplete: ${detail}`);
    }
    return this.portfolios.create(this.renderer.render(prepared.release, prepared.inclusion.decisions));
  }
}

import { templateFamilies, type TemplateFamily } from "../../domains/publication/domain/career-portfolio.js";
import type { ReleaseDigester } from "../../domains/publication/ports/knowledge-release-ports.js";
import { MaterialCareerPortfolioRenderer } from "./material-career-portfolio-renderer.js";
import { StaticHtmlCareerPortfolioRenderer } from "./static-html-career-portfolio-renderer.js";

/** Resolves a template family name to its renderer; unknown names fail before anything is written. */
export function careerPortfolioRenderer(template: string | undefined, digester: ReleaseDigester) {
  const family = (template ?? "editorial-record") as TemplateFamily;
  if (!templateFamilies.includes(family))
    throw new Error(`Portfolio template must be one of: ${templateFamilies.join(", ")}.`);
  return family === "material-profile"
    ? new MaterialCareerPortfolioRenderer(digester)
    : new StaticHtmlCareerPortfolioRenderer(digester);
}

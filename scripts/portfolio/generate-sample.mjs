import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { LocalCareerPortfolioRepository } from "../../dist/adapters/publication/local-career-portfolio-repository.js";
import { NodeReleaseDigester } from "../../dist/adapters/publication/node-release-digester.js";
import { StaticHtmlCareerPortfolioRenderer } from "../../dist/adapters/publication/static-html-career-portfolio-renderer.js";

const destination = process.argv[2];
if (!destination) {
  process.stderr.write("Usage: pnpm portfolio:sample -- <output-directory>\n");
  process.exitCode = 2;
} else {
  const fixturePath = resolve("skills/output-career-portfolio/assets/sample-release.json");
  const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
  const digester = new NodeReleaseDigester();
  const renderer = new StaticHtmlCareerPortfolioRenderer(digester);
  const projection = renderer.render(
    fixture.release,
    fixture.inclusionDecisions,
    fixture.options,
  );
  const stored = await new LocalCareerPortfolioRepository(resolve(destination), digester).create(projection);
  process.stdout.write(`${stored.directory}\n`);
}

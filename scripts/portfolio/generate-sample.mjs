import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseArgs } from "node:util";

import { careerPortfolioRenderer } from "../../dist/adapters/publication/career-portfolio-renderers.js";
import { LocalCareerPortfolioRepository } from "../../dist/adapters/publication/local-career-portfolio-repository.js";
import { NodeReleaseDigester } from "../../dist/adapters/publication/node-release-digester.js";

const { values, positionals } = parseArgs({ allowPositionals: true, args: process.argv.slice(2).filter(arg => arg !== "--"),
  options: { template: { type: "string", default: "editorial-record" } } });
const destination = positionals[0];
if (!destination) {
  process.stderr.write("Usage: pnpm portfolio:sample -- <output-directory> [--template <editorial-record|material-profile>]\n");
  process.exitCode = 2;
} else {
  const fixturePath = resolve("skills/output-career-portfolio/assets/sample-release.json");
  const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
  const digester = new NodeReleaseDigester();
  const projection = careerPortfolioRenderer(values.template, digester)
    .render(fixture.release, fixture.inclusionDecisions, { ...fixture.options, template: values.template });
  const stored = await new LocalCareerPortfolioRepository(resolve(destination), digester).create(projection);
  process.stdout.write(`${stored.directory}\n`);
}

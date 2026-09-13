import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { CareerPortfolioProjection } from "../../domains/publication/domain/career-portfolio.js";
import type { CareerPortfolioRepository } from "../../domains/publication/ports/career-portfolio-ports.js";
import type { ReleaseDigester } from "../../domains/publication/ports/knowledge-release-ports.js";

export class LocalCareerPortfolioRepository implements CareerPortfolioRepository {
  public constructor(private readonly root: string, private readonly digester: ReleaseDigester) {}

  public async create(projection: CareerPortfolioProjection) {
    await mkdir(this.root, { recursive: true, mode: 0o700 });
    const directory = join(this.root, projection.manifest.portfolioId);
    try {
      const existing = JSON.parse(await readFile(join(directory, "portfolio-manifest.json"), "utf8")) as CareerPortfolioProjection["manifest"];
      const valid = existing.projectionDigest === projection.manifest.projectionDigest &&
        JSON.stringify(existing) === JSON.stringify(projection.manifest) &&
        (await Promise.all(projection.manifest.files.map(async (file) =>
          this.digester.sha256(await readFile(join(directory, file.path))) === file.sha256))).every(Boolean);
      if (valid) return Object.freeze({ directory, projection, reused: true });
      throw new Error(`Portfolio directory already exists with different or invalid content: ${directory}`);
    } catch (error: unknown) {
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
    }
    const temporary = join(this.root, `.${projection.manifest.portfolioId}-${randomUUID()}.tmp`);
    await mkdir(temporary, { mode: 0o700 });
    try {
      await writeFile(join(temporary, "index.html"), projection.files["index.html"], { mode: 0o600, flag: "wx" });
      await writeFile(join(temporary, "portfolio.json"), projection.files["portfolio.json"], { mode: 0o600, flag: "wx" });
      await writeFile(join(temporary, "portfolio-manifest.json"), `${JSON.stringify(projection.manifest, null, 2)}\n`, { mode: 0o600, flag: "wx" });
      await rename(temporary, directory);
      return Object.freeze({ directory, projection, reused: false });
    } catch (error: unknown) { await rm(temporary, { recursive: true, force: true }); throw error; }
  }
}

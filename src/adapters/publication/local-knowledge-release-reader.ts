import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { ValidatedKnowledgeRelease } from "../../domains/publication/domain/career-portfolio.js";
import { releasePayloadFiles, type ReleaseInputRecord } from "../../domains/publication/domain/knowledge-release.js";
import type { KnowledgeReleaseReader } from "../../domains/publication/ports/career-portfolio-ports.js";
import type { ReleaseDigester } from "../../domains/publication/ports/knowledge-release-ports.js";
import { validateLocalRelease } from "./local-release-repository.js";

export class LocalKnowledgeReleaseReader implements KnowledgeReleaseReader {
  public constructor(private readonly digester: ReleaseDigester) {}

  public async readValidated(directory: string): Promise<ValidatedKnowledgeRelease> {
    const validation = await validateLocalRelease(directory, this.digester);
    if (!validation.valid || validation.manifest === undefined) {
      throw new Error(`Knowledge release is invalid: ${validation.errors.join(" ")}`);
    }
    const records: ReleaseInputRecord[] = [];
    for (const file of releasePayloadFiles) {
      const content = await readFile(join(directory, file), "utf8");
      for (const line of content.trim().length === 0 ? [] : content.trimEnd().split("\n")) {
        records.push(JSON.parse(line) as ReleaseInputRecord);
      }
    }
    return Object.freeze({ directory, manifest: validation.manifest,
      records: Object.freeze(records.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)) });
  }
}

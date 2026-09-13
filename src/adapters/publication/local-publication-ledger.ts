import { randomUUID } from "node:crypto";
import { link, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { StaticPortfolioPublicationResult } from "../../domains/publication/domain/destination-publication.js";
import type { PublicationDigester, PublicationLedger } from "../../domains/publication/ports/destination-publication-ports.js";

interface StoredPublication { readonly idempotencyKey: string; readonly fingerprint: string; readonly result: StaticPortfolioPublicationResult }

export class LocalPublicationLedger implements PublicationLedger {
  public constructor(private readonly root: string, private readonly digester: PublicationDigester) {}
  private path(key: string): string { return join(this.root, `${this.digester.sha256(key)}.json`); }

  public async find(idempotencyKey: string) {
    try {
      const stored = JSON.parse(await readFile(this.path(idempotencyKey), "utf8")) as StoredPublication;
      if (stored.idempotencyKey !== idempotencyKey) throw new Error("Publication ledger identity mismatch.");
      return Object.freeze({ fingerprint: stored.fingerprint, result: stored.result });
    } catch (error: unknown) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") return undefined;
      throw error;
    }
  }

  public async save(idempotencyKey: string, fingerprint: string, result: StaticPortfolioPublicationResult): Promise<void> {
    await mkdir(this.root, { recursive: true, mode: 0o700 });
    const path = this.path(idempotencyKey); const temporary = `${path}.${randomUUID()}.tmp`;
    await writeFile(temporary, `${JSON.stringify({ idempotencyKey, fingerprint, result }, null, 2)}\n`, { mode: 0o600, flag: "wx" });
    try { await link(temporary, path); }
    catch (error: unknown) {
      if (!(error instanceof Error && "code" in error && error.code === "EEXIST")) throw error;
      const existing = await this.find(idempotencyKey);
      if (existing?.fingerprint !== fingerprint) throw new Error("Publication ledger idempotency conflict.");
    } finally { await rm(temporary, { force: true }); }
  }
}

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import type { StaticPortfolioPublicationResult } from "../../domains/publication/domain/destination-publication.js";
import { LocalPublicationLedger } from "./local-publication-ledger.js";
import { NodeReleaseDigester } from "./node-release-digester.js";

test("persists a successful publication result under a non-path idempotency identity", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-ledger-"));
  try {
    const ledger = new LocalPublicationLedger(root, new NodeReleaseDigester());
    const result: StaticPortfolioPublicationResult = { provider: "firebase-hosting", projectId: "project",
      target: "portfolio", mode: "live", state: "observed-public", safeUrl: "https://project.web.app",
      observedVisibility: "public", portfolioDigest: "abc", warnings: [] };
    await ledger.save("../../unsafe/key", "fingerprint", result);
    const stored = await ledger.find("../../unsafe/key");
    assert.equal(stored?.fingerprint, "fingerprint");
    assert.deepEqual(stored?.result, result);
    assert.equal(await ledger.find("another-key"), undefined);
  } finally { await rm(root, { recursive: true, force: true }); }
});

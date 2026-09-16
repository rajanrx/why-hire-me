import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import test from "node:test";

const execute = promisify(execFile);
const script = "skills/output-notebooklm-sync/scripts/prepare-handoff.mjs";

test("NotebookLM handoff preserves the complete portfolio and isolates the fallback", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-notebooklm-"));
  try {
    const source = join(root, "portfolio.json");
    const output = join(root, "handoff");
    const portfolio = `${JSON.stringify({
      schema: "why-hire-me.portfolio-data/v0.4",
      buildMarker: "why-hire-me.build/v1",
      displayModel: {
        items: [{ id: "role-1", type: "Role", name: "Technical Lead" }],
        relations: [{ id: "relation-1", subject: "role-1", predicate: "used", object: "tech-1" }],
        links: [{ id: "link-1", label: "Product documentation", url: "https://example.com/docs", sourceStatus: "person-supplied" }],
      },
    }, null, 2)}\n`;
    await writeFile(source, portfolio);

    await execute(process.execPath, [script, "--portfolio", source, "--output", output]);

    assert.deepEqual(await readFile(join(output, "portfolio.json")), Buffer.from(portfolio));
    assert.deepEqual(await readFile(join(output, "portfolio-json.txt")), Buffer.from(portfolio));
    const manifest = JSON.parse(await readFile(join(output, "notebooklm-handoff.json"), "utf8")) as {
      counts: { items: number; relations: number; links: number };
      files: Array<{ path: string; role: string; alternativeFor?: string; sha256: string }>;
    };
    assert.deepEqual(manifest.counts, { items: 1, relations: 1, links: 1 });
    assert.equal(manifest.files[0]?.role, "primary-projection");
    assert.equal(manifest.files[1]?.role, "format-fallback");
    assert.equal(manifest.files[1]?.alternativeFor, "portfolio.json");
    assert.equal(manifest.files[0]?.sha256, manifest.files[1]?.sha256);
    const references = await readFile(join(output, "approved-reference-sources.md"), "utf8");
    assert.match(references, /Product documentation/);
    assert.match(references, /https:\/\/example\.com\/docs/);
    assert.doesNotMatch(references, /Technical Lead/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("NotebookLM handoff rejects a rendered or partial substitute", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-notebooklm-"));
  try {
    const source = join(root, "portfolio.json");
    await writeFile(source, JSON.stringify({ schema: "why-hire-me.portfolio-data/v0.4", displayModel: { items: [] } }));
    await assert.rejects(
      execute(process.execPath, [script, "--portfolio", source, "--output", join(root, "handoff")]),
      /complete items, relations, and links arrays/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

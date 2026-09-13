import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? sourceFiles(path) : entry.name.endsWith(".ts") ? [path] : [];
    }),
  );
  return nested.flat();
}

test("domain modules do not depend on adapters or apps", async () => {
  const files = await sourceFiles(join(process.cwd(), "src", "domains"));

  for (const file of files) {
    const source = await readFile(file, "utf8");
    assert.doesNotMatch(source, /from\s+["'][^"']*(?:adapters|apps)[^"']*["']/, file);
  }
});

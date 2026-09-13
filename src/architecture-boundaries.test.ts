import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import test from "node:test";

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory()
        ? sourceFiles(path)
        : entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")
          ? [path]
          : [];
    }),
  );
  return nested.flat();
}

function moduleSpecifiers(source: string): string[] {
  const patterns = [
    /(?:import|export)\s+(?:type\s+)?(?:[^"'()]*?\s+from\s+)?["']([^"']+)["']/g,
    /import\s*\(\s*["']([^"']+)["']/g,
    /import\s+[^=]+?=\s*require\s*\(\s*["']([^"']+)["']/g,
  ];
  const specifiers = new Set<string>();
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const specifier = match[1];
      if (specifier !== undefined) {
        specifiers.add(specifier);
      }
    }
  }
  return [...specifiers];
}

test("architecture scanner recognises supported module dependency forms", () => {
  const source = `
    import value from "one";
    import "two";
    export type { Type } from "three";
    const lazy = import("four");
    import legacy = require("five");
  `;

  assert.deepEqual(moduleSpecifiers(source).sort(), ["five", "four", "one", "three", "two"]);
});

test("production domain modules depend only on their own bounded context", async () => {
  const domainsRoot = join(process.cwd(), "src", "domains");
  const files = await sourceFiles(domainsRoot);
  assert.ok(
    files.some((file) => file.includes("evidence-acquisition")),
    "Evidence Acquisition must be included in the boundary scan",
  );
  assert.ok(files.some((file) => file.includes("knowledge-enrichment")), "Knowledge Enrichment must be included in the boundary scan");

  for (const file of files) {
    const source = await readFile(file, "utf8");
    const owner = relative(domainsRoot, file).split("/")[0];
    for (const specifier of moduleSpecifiers(source)) {
      assert.ok(
        specifier.startsWith("."),
        `${file} imports external module ${specifier} instead of an owned port`,
      );
      const target = resolve(dirname(file), specifier.replace(/\.js$/, ".ts"));
      const targetDomain = relative(domainsRoot, target).split("/")[0];
      assert.equal(
        targetDomain,
        owner,
        `${file} imports another bounded context through ${specifier}`,
      );
    }
  }
});

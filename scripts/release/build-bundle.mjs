import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { create } from "tar";

const packageManifest = JSON.parse(await readFile("package.json", "utf8"));
const version = packageManifest.version;
const bundleName = `why-hire-me-v${version}.tar.gz`;
const outputDirectory = "release";
const outputPath = `${outputDirectory}/${bundleName}`;
const archiveRoot = `why-hire-me-v${version}`;

const distributableFiles = [
  ".claude-plugin",
  ".codex-plugin",
  "CHANGELOG.md",
  "COMMERCIAL-LICENSING.md",
  "docs/examples.md",
  "docs/examples",
  "docs/stability.md",
  "docs/licensing.md",
  "LICENSE",
  "NOTICE",
  "README.md",
  "TRADEMARKS.md",
  "dist",
  "package.json",
  "skills",
  "scripts/license",
  "scripts/portfolio",
  "templates",
];

await mkdir(outputDirectory, { recursive: true });
await create(
  {
    cwd: process.cwd(),
    file: outputPath,
    gzip: true,
    noMtime: true,
    portable: true,
    prefix: archiveRoot,
    filter: (path) => !path.includes(".test.") && !path.endsWith(".js.map"),
  },
  distributableFiles,
);

const digest = createHash("sha256").update(await readFile(outputPath)).digest("hex");
const checksumPath = `${outputPath}.sha256`;
await writeFile(checksumPath, `${digest}  ${bundleName}\n`, "utf8");

process.stdout.write(`${outputPath}\n${checksumPath}\n`);

import { readFile, writeFile } from "node:fs/promises";

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

const packageManifest = await readJson("package.json");
const version = packageManifest.version;

const codexManifest = await readJson(".codex-plugin/plugin.json");
codexManifest.version = version;
await writeJson(".codex-plugin/plugin.json", codexManifest);

const claudeManifest = await readJson(".claude-plugin/plugin.json");
claudeManifest.version = version;
await writeJson(".claude-plugin/plugin.json", claudeManifest);

const claudeMarketplace = await readJson(".claude-plugin/marketplace.json");
claudeMarketplace.plugins[0].version = version;
await writeJson(".claude-plugin/marketplace.json", claudeMarketplace);

process.stdout.write(`Synced plugin manifests to ${version}.\n`);

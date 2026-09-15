import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const ttlMs = 4 * 60 * 60 * 1000;
const releaseUrl = "https://api.github.com/repos/rajanrx/why-hire-me/releases/latest";
const skillRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const cacheRoot = process.env.XDG_CACHE_HOME || join(homedir(), ".cache");
const cachePath = join(cacheRoot, "why-hire-me", "skill-version-check.json");
const offline = process.argv.includes("--offline");
const installed = (await readFile(join(skillRoot, "VERSION"), "utf8")).trim();

function parts(value) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(value);
  return match ? match.slice(1).map(Number) : null;
}

function newer(latest, current) {
  const a = parts(latest);
  const b = parts(current);
  if (!a || !b) return null;
  for (let i = 0; i < 3; i += 1) {
    if (a[i] !== b[i]) return a[i] > b[i];
  }
  return false;
}

let cached;
try { cached = JSON.parse(await readFile(cachePath, "utf8")); } catch { /* no cache */ }
const fresh = cached && Date.now() - cached.checkedAt < ttlMs;
let latest = cached?.latest;
let source = fresh ? "cache" : "none";
let warning;

if (!offline && !fresh) {
  try {
    const response = await fetch(releaseUrl, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "why-hire-me-skill-version-check" },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    const release = await response.json();
    if (!parts(release.tag_name)) throw new Error("Latest release has no stable version tag");
    latest = release.tag_name.replace(/^v/, "");
    source = "github-release";
    await mkdir(dirname(cachePath), { recursive: true });
    await writeFile(cachePath, JSON.stringify({ latest, checkedAt: Date.now() }) + "\n", { mode: 0o600 });
  } catch (error) {
    source = latest ? "stale-cache" : "unavailable";
    warning = String(error.message || error);
  }
} else if (offline) {
  source = latest ? (fresh ? "offline-cache" : "offline-stale-cache") : "offline-unavailable";
}

const comparison = latest ? newer(latest, installed) : null;
process.stdout.write(JSON.stringify({
  installed,
  latest: latest || null,
  status: comparison === true ? "update-available" : comparison === false ? "up-to-date" : "unknown",
  source,
  checkedAt: source === "github-release" ? Date.now() : cached?.checkedAt || null,
  cacheHours: 4,
  warning: warning || null,
}) + "\n");

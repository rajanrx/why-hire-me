import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const publicRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const designRoot = resolve(process.env.WHY_HIRE_ME_PRIVATE_DESIGN_ROOT ??
  join(publicRoot, "..", "why-hire-me-intent"));
const required = process.argv.includes("--required");
const available = existsSync(join(designRoot, "intent", "specs")) &&
  existsSync(join(designRoot, "openspec", "config.yaml"));

if (!available) {
  const message = `Private design validation ${required ? "failed" : "skipped"}: ` +
    `checkout unavailable at ${designRoot}. Public code and tests can still run independently.\n`;
  (required ? process.stderr : process.stdout).write(message);
  if (required) process.exitCode = 1;
} else {
  const environment = { ...process.env, WHY_HIRE_ME_PRIVATE_DESIGN_ROOT: designRoot };
  const run = (executable, args, cwd) => {
    const result = spawnSync(executable, args, { cwd, env: environment, stdio: "inherit" });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
  };
  const openspec = join(publicRoot, "node_modules", ".bin", "openspec");
  const tsx = join(publicRoot, "node_modules", ".bin", "tsx");
  run(openspec, ["validate", "--all", "--strict", "--no-interactive"], designRoot);
  run(openspec, ["validate", "--archived", "--strict", "--no-interactive"], designRoot);
  run(tsx, [join(publicRoot, "scripts", "spec", "validate-intent-links.ts")], publicRoot);
  process.stdout.write(`Private intent and OpenSpec validation passed at ${designRoot}.\n`);
}

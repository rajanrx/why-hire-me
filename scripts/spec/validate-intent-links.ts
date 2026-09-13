import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "yaml";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const intentRoot = join(repositoryRoot, "intent", "specs");
const changesRoot = join(repositoryRoot, "openspec", "changes");
const allowedTypes = new Set(["goal", "domain", "adr", "rfc", "standard"]);

interface IntentReference {
  readonly type?: unknown;
  readonly id?: unknown;
  readonly path?: unknown;
  readonly reason?: unknown;
}

interface IntentLinkFile {
  readonly schema?: unknown;
  readonly change?: unknown;
  readonly references?: unknown;
}

async function existingChangeDirectories(): Promise<string[]> {
  try {
    const entries = await readdir(changesRoot, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory() && entry.name !== "archive").map((entry) => entry.name);
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

function requireString(value: unknown, label: string, errors: string[]): value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`${label} must be a non-empty string`);
    return false;
  }
  return true;
}

async function validateChange(change: string): Promise<string[]> {
  const errors: string[] = [];
  const linkPath = join(changesRoot, change, "intent.yaml");
  let document: IntentLinkFile;

  try {
    document = parse(await readFile(linkPath, "utf8")) as IntentLinkFile;
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [`${change}: missing intent.yaml`];
    }
    return [`${change}: cannot parse intent.yaml: ${String(error)}`];
  }

  if (document.schema !== "why-hire-me-intent/v1") {
    errors.push(`${change}: schema must be why-hire-me-intent/v1`);
  }
  if (document.change !== change) {
    errors.push(`${change}: change must match the directory name`);
  }
  if (!Array.isArray(document.references) || document.references.length === 0) {
    errors.push(`${change}: references must contain at least one intent link`);
    return errors;
  }

  for (const [index, rawReference] of document.references.entries()) {
    const reference = rawReference as IntentReference;
    const prefix = `${change}: references[${index}]`;
    const typeValid = requireString(reference.type, `${prefix}.type`, errors);
    const idValid = requireString(reference.id, `${prefix}.id`, errors);
    const pathValid = requireString(reference.path, `${prefix}.path`, errors);
    requireString(reference.reason, `${prefix}.reason`, errors);

    if (typeValid && !allowedTypes.has(reference.type)) {
      errors.push(`${prefix}.type is not supported: ${reference.type}`);
    }
    if (!idValid || !pathValid) {
      continue;
    }

    const target = resolve(repositoryRoot, reference.path);
    const relativeTarget = relative(intentRoot, target);
    if (relativeTarget.startsWith(`..${sep}`) || relativeTarget === ".." || relativeTarget === "") {
      errors.push(`${prefix}.path must resolve to a file below intent/specs`);
      continue;
    }

    try {
      if (!(await stat(target)).isFile()) {
        errors.push(`${prefix}.path is not a file: ${reference.path}`);
        continue;
      }
      const content = await readFile(target, "utf8");
      if (!content.includes(reference.id)) {
        errors.push(`${prefix}.id ${reference.id} was not found in ${reference.path}`);
      }
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        errors.push(`${prefix}.path does not exist: ${reference.path}`);
      } else {
        throw error;
      }
    }
  }

  return errors;
}

const changes = await existingChangeDirectories();
const errors = (await Promise.all(changes.map(validateChange))).flat();

if (errors.length > 0) {
  process.stderr.write(`${errors.map((error) => `- ${error}`).join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Intent links valid for ${changes.length} active change(s).\n`);
}

import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "yaml";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const intentRoot = join(repositoryRoot, "intent", "specs");
const changesRoot = join(repositoryRoot, "openspec", "changes");
const allowedTypes = new Set(["goal", "domain", "port", "adr", "rfc", "standard"]);

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

interface ChangeLocation {
  readonly label: string;
  readonly path: string;
  readonly archived: boolean;
}

async function directoriesBelow(root: string): Promise<string[]> {
  try {
    const entries = await readdir(root, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function existingChanges(): Promise<ChangeLocation[]> {
  const active = (await directoriesBelow(changesRoot))
    .filter((name) => name !== "archive")
    .map((name) => ({ label: name, path: join(changesRoot, name), archived: false }));
  const archiveRoot = join(changesRoot, "archive");
  const archived = (await directoriesBelow(archiveRoot)).map((name) => ({
    label: `archive/${name}`,
    path: join(archiveRoot, name),
    archived: true,
  }));
  return [...active, ...archived];
}

function requireString(value: unknown, label: string, errors: string[]): value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`${label} must be a non-empty string`);
    return false;
  }
  return true;
}

async function validateChange(change: ChangeLocation): Promise<string[]> {
  const errors: string[] = [];
  const linkPath = join(change.path, "intent.yaml");
  let document: IntentLinkFile;

  try {
    document = parse(await readFile(linkPath, "utf8")) as IntentLinkFile;
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [`${change.label}: missing intent.yaml`];
    }
    return [`${change.label}: cannot parse intent.yaml: ${String(error)}`];
  }

  if (document.schema !== "why-hire-me-intent/v1") {
    errors.push(`${change.label}: schema must be why-hire-me-intent/v1`);
  }
  const nameMatches =
    typeof document.change === "string" &&
    (change.archived
      ? change.label.endsWith(`-${document.change}`)
      : change.label === document.change);
  if (!nameMatches) {
    errors.push(`${change.label}: change must match its active or date-prefixed archive directory`);
  }
  if (!Array.isArray(document.references) || document.references.length === 0) {
    errors.push(`${change.label}: references must contain at least one intent link`);
    return errors;
  }

  for (const [index, rawReference] of document.references.entries()) {
    const reference = rawReference as IntentReference;
    const prefix = `${change.label}: references[${index}]`;
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

const changes = await existingChanges();
const errors = (await Promise.all(changes.map(validateChange))).flat();

if (errors.length > 0) {
  process.stderr.write(`${errors.map((error) => `- ${error}`).join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Intent links valid for ${changes.length} active or archived change(s).\n`);
}

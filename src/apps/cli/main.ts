#!/usr/bin/env node

import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

import { SqlitePersonProfileRepository } from "../../adapters/persistence/sqlite/sqlite-person-profile-repository.js";
import { CreatePersonProfile } from "../../domains/person-knowledge/application/create-person-profile.js";

function option(args: readonly string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

function usage(): string {
  return [
    "Usage:",
    "  why-hire-me profile create --name <display-name> [--database <path>]",
    "",
    "Environment:",
    "  WHY_HIRE_ME_HOME  Local data directory (default: ~/.why-hire-me)",
  ].join("\n");
}

async function main(args: readonly string[]): Promise<void> {
  if (args[0] !== "profile" || args[1] !== "create") {
    throw new Error(usage());
  }

  const displayName = option(args, "--name");
  if (displayName === undefined) {
    throw new Error(`Missing --name.\n\n${usage()}`);
  }

  const home = process.env.WHY_HIRE_ME_HOME ?? join(homedir(), ".why-hire-me");
  const databasePath = resolve(option(args, "--database") ?? join(home, "knowledge.db"));
  mkdirSync(dirname(databasePath), { recursive: true, mode: 0o700 });

  const repository = new SqlitePersonProfileRepository(databasePath);
  try {
    const useCase = new CreatePersonProfile(
      repository,
      { generate: randomUUID },
      { now: () => new Date() },
    );
    const profile = await useCase.execute({ displayName });
    process.stdout.write(`${JSON.stringify({ profile, databasePath }, null, 2)}\n`);
  } finally {
    repository.close();
  }
}

main(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});

import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

import { SqliteCaptureRepository } from "../../adapters/persistence/sqlite/sqlite-capture-repository.js";
import { SqlitePersonProfileRepository } from "../../adapters/persistence/sqlite/sqlite-person-profile-repository.js";
import { ContentAddressedSnapshotRepository } from "../../adapters/snapshots/content-addressed-snapshot-repository.js";
import { LocalFileSourceReader } from "../../adapters/sources/local-file-source-reader.js";
import { CaptureSource } from "../../domains/evidence-acquisition/application/capture-source.js";
import type { CaptureRecord } from "../../domains/evidence-acquisition/domain/capture-record.js";
import { CreatePersonProfile } from "../../domains/person-knowledge/application/create-person-profile.js";
import type { PersonProfile } from "../../domains/person-knowledge/domain/person-profile.js";

export type CliResult =
  | {
      readonly kind: "profile-created";
      readonly profile: PersonProfile;
      readonly databasePath: string;
    }
  | {
      readonly kind: "source-captured";
      readonly capture: CaptureRecord;
      readonly databasePath: string;
      readonly snapshotRoot: string;
    };

function option(args: readonly string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (value === undefined || value.startsWith("--")) {
    throw new Error(`Missing value for ${name}.`);
  }
  return value;
}

function requiredOption(args: readonly string[], name: string): string {
  const value = option(args, name);
  if (value === undefined) {
    throw new Error(`Missing ${name}.\n\n${usage()}`);
  }
  return value;
}

function localPaths(args: readonly string[], environment: NodeJS.ProcessEnv) {
  const home = environment.WHY_HIRE_ME_HOME ?? join(homedir(), ".why-hire-me");
  const databasePath = resolve(option(args, "--database") ?? join(home, "knowledge.db"));
  const snapshotRoot = resolve(option(args, "--snapshots") ?? join(dirname(databasePath), "snapshots"));
  return { databasePath, snapshotRoot };
}

export function usage(): string {
  return [
    "Usage:",
    "  why-hire-me profile create --name <display-name> [--database <path>]",
    "  why-hire-me source ingest --profile <profile-id> --file <path> [options]",
    "",
    "Environment:",
    "  WHY_HIRE_ME_HOME  Local data directory (default: ~/.why-hire-me)",
    "",
    "Source options:",
    "  --actor <id> --purpose <text> --idempotency-key <key> --correlation-id <id>",
    "  --database <path> --snapshots <path>",
  ].join("\n");
}

export async function runCli(
  args: readonly string[],
  environment: NodeJS.ProcessEnv = process.env,
): Promise<CliResult> {
  const { databasePath, snapshotRoot } = localPaths(args, environment);

  if (args[0] === "profile" && args[1] === "create") {
    mkdirSync(dirname(databasePath), { recursive: true, mode: 0o700 });
    const displayName = requiredOption(args, "--name");
    const repository = new SqlitePersonProfileRepository(databasePath);
    try {
      const useCase = new CreatePersonProfile(
        repository,
        { generate: randomUUID },
        { now: () => new Date() },
      );
      const profile = await useCase.execute({ displayName });
      return Object.freeze({ kind: "profile-created", profile, databasePath });
    } finally {
      repository.close();
    }
  }

  if (args[0] === "source" && args[1] === "ingest") {
    const profileId = requiredOption(args, "--profile");
    const requestedLocator = requiredOption(args, "--file");
    const actorId = option(args, "--actor") ?? "local-user";
    const purpose = option(args, "--purpose") ?? "build-person-knowledge";
    const idempotencyKey = option(args, "--idempotency-key") ?? randomUUID();
    const correlationId = option(args, "--correlation-id") ?? randomUUID();
    mkdirSync(dirname(databasePath), { recursive: true, mode: 0o700 });
    mkdirSync(snapshotRoot, { recursive: true, mode: 0o700 });
    const profiles = new SqlitePersonProfileRepository(databasePath);
    const snapshots = new ContentAddressedSnapshotRepository(snapshotRoot);
    const captures = new SqliteCaptureRepository(databasePath, snapshots);
    try {
      const useCase = new CaptureSource(
        profiles,
        new LocalFileSourceReader(),
        snapshots,
        captures,
        { generate: randomUUID },
        { now: () => new Date() },
      );
      const capture = await useCase.execute({
        profileId,
        requestedLocator,
        actorId,
        purpose,
        permissionScope: `local-file:${requestedLocator}`,
        idempotencyKey,
        correlationId,
      });
      return Object.freeze({
        kind: "source-captured",
        capture,
        databasePath,
        snapshotRoot,
      });
    } finally {
      captures.close();
      profiles.close();
    }
  }

  throw new Error(usage());
}

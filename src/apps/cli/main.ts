#!/usr/bin/env node

import { runCli } from "./run-cli.js";

async function main(args: readonly string[]): Promise<void> {
  const result = await runCli(args);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});

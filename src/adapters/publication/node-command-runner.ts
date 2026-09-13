import { execFile } from "node:child_process";

import type { CommandRunner } from "./firebase-hosting-publisher.js";

export class NodeCommandRunner implements CommandRunner {
  public run(command: string, args: readonly string[], options: { readonly cwd: string; readonly environment: Readonly<Record<string, string>> }) {
    return new Promise<{ exitCode: number; stdout: string; stderr: string }>((resolve) => {
      execFile(command, [...args], { cwd: options.cwd, env: { ...options.environment }, timeout: 120_000,
        maxBuffer: 4 * 1024 * 1024 }, (error, stdout, stderr) => {
          resolve({ exitCode: typeof error?.code === "number" ? error.code : error ? 1 : 0, stdout, stderr });
        });
    });
  }
}

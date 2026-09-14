#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const marker = "why-hire-me.build/v1";
const result = spawnSync("gh", ["search", "code", marker, "--limit", "100", "--json", "repository,path,url"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});

if (result.error?.code === "ENOENT") {
  console.error("GitHub CLI is required. Install gh, authenticate, and run this command again.");
  process.exitCode = 2;
} else if (result.status !== 0) {
  console.error(result.stderr.trim() || "GitHub public-code search failed.");
  process.exitCode = result.status ?? 1;
} else {
  const matches = JSON.parse(result.stdout || "[]");
  console.log(JSON.stringify({ marker, scope: "public GitHub code only", matches }, null, 2));
}

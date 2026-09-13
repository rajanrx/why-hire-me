import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import test from "node:test";

import { list } from "tar";

const execute = promisify(execFile);

test("release bundle contains end-user files and excludes development material", async () => {
  await execute(process.execPath, ["scripts/release/build-bundle.mjs"], {
    cwd: process.cwd(),
  });

  const packageManifest = JSON.parse(await readFile("package.json", "utf8")) as {
    version: string;
  };
  const root = `why-hire-me-v${packageManifest.version}`;
  const entries: string[] = [];

  await list({
    file: `release/${root}.tar.gz`,
    onentry: (entry) => entries.push(entry.path),
  });

  for (const required of [
    `${root}/.codex-plugin/plugin.json`,
    `${root}/.claude-plugin/plugin.json`,
    `${root}/docs/examples.md`,
    `${root}/docs/examples/development-cli.md`,
    `${root}/dist/apps/cli/main.js`,
    `${root}/skills/daily-work-diary/SKILL.md`,
    `${root}/skills/evidence-led-interviewer/SKILL.md`,
    `${root}/skills/input-resume-explorer/SKILL.md`,
    `${root}/skills/input-work-evidence-explorer/SKILL.md`,
    `${root}/skills/input-career-reference-explorer/SKILL.md`,
    `${root}/skills/knowledge-curator/SKILL.md`,
    `${root}/skills/output-career-knowledge-guide/SKILL.md`,
    `${root}/skills/async-interview/SKILL.md`,
  ]) {
    assert.ok(entries.includes(required), `missing distributable entry: ${required}`);
  }

  for (const developmentDirectory of ["intent", "openspec", "src", ".github", ".changeset"]) {
    assert.equal(
      entries.some((entry) => entry.startsWith(`${root}/${developmentDirectory}/`)),
      false,
      `${developmentDirectory} must not be shipped in the end-user bundle`,
    );
  }

  assert.equal(entries.includes(`${root}/docs/development-cli.md`), false);

  assert.equal(entries.some((entry) => entry.includes(".test.")), false);
  assert.equal(entries.some((entry) => entry.endsWith(".js.map")), false);
});

test("plugin namespace qualifies portable skill names", async () => {
  const plugin = JSON.parse(await readFile(".codex-plugin/plugin.json", "utf8")) as {
    name: string;
    skills: string;
  };
  assert.equal(plugin.name, "why-hire-me");
  assert.equal(plugin.skills, "./skills/");

  for (const skillName of [
    "async-interview",
    "daily-work-diary",
    "evidence-led-interviewer",
    "input-career-reference-explorer",
    "input-resume-explorer",
    "input-work-evidence-explorer",
    "knowledge-curator",
    "output-career-knowledge-guide",
  ]) {
    const skill = await readFile(`skills/${skillName}/SKILL.md`, "utf8");
    assert.match(skill, new RegExp(`^---\\nname: ${skillName}\\n`));
    assert.equal(`${plugin.name}:${skillName}`, `why-hire-me:${skillName}`);
  }
});

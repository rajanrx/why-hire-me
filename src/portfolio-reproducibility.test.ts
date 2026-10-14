import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { cp, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import test from "node:test";

const execute = promisify(execFile);
const scripts = resolve("scripts/portfolio");
const sample = resolve("skills/output-career-portfolio/assets/sample-packet");
/** The fictional sample after its amendments; any machine must produce exactly this bundle. */
const SAMPLE_V2_DIGEST = "2cf994d35fdc1abeabca779c2a533a567f409c73028dd9892c7d5613d26d419b";

const handoffScript = resolve("skills/output-notebooklm-sync/scripts/prepare-handoff.mjs");
const run = async (cwd: string, script: string, ...args: string[]) =>
  JSON.parse((await execute(process.execPath, [join(scripts, script), ...args], { cwd })).stdout.trim().split("\n").join(""));
const handoff = async (cwd: string) =>
  (await execute(process.execPath, [handoffScript, "--portfolio", "v2/portfolio.json", "--output", "handoff"], { cwd })).stdout.trim();
const HANDOFF_FILES = ["portfolio.json", "portfolio-json.txt", "approved-reference-sources.md", "notebooklm-handoff.json"];

/** First build, approval, interview amendments, rebuild, résumé, and NotebookLM handoff, from `work`. */
async function workflow(work: string) {
  await cp(sample, join(work, "career"), { recursive: true });
  const career = join(work, "career");
  await run(work, "preview-reviewed-prototype.mjs", "--packet", "career/reviewed-packet-v1.json", "--output", "v1", "--template", "material-profile");
  await run(work, "approve-candidate.mjs", "--candidate", "v1", "--target", "career/public", "--approved-by", "Alex");
  await run(career, "amend-reviewed-packet.mjs", "--packet", "reviewed-packet-v1.json", "--amendments", "amendments-v2.json", "--output", "reviewed-packet-v2.json");
  const v2 = await run(tmpdir(), "preview-reviewed-prototype.mjs", "--packet", join(career, "reviewed-packet-v2.json"),
    "--baseline", career, "--output", join(work, "v2"), "--template", "material-profile");
  await run(work, "print-resume.mjs", "--portfolio", "v2", "--output", "resume.html");
  await handoff(work);
  return { v2 };
}

test("the reviewed-packet workflow is reproducible across directories and safe to re-run", { timeout: 120_000 }, async () => {
  const [first, second] = [await mkdtemp(join(tmpdir(), "whm-a-")), await mkdtemp(join(tmpdir(), "whm-b-"))];
  try {
    const a = await workflow(first), b = await workflow(second);
    assert.equal(a.v2.projectionDigest, SAMPLE_V2_DIGEST);
    assert.equal(b.v2.projectionDigest, SAMPLE_V2_DIGEST);
    for (const name of await readdir(join(first, "v2"))) if (name !== "generation-record.json")
      assert.ok((await readFile(join(first, "v2", name))).equals(await readFile(join(second, "v2", name))), `${name} differs`);
    assert.ok((await readFile(join(first, "resume.html"))).equals(await readFile(join(second, "resume.html"))));
    for (const name of HANDOFF_FILES)
      assert.ok((await readFile(join(first, "handoff", name))).equals(await readFile(join(second, "handoff", name))), `${name} differs`);

    const again = await run(first, "preview-reviewed-prototype.mjs", "--packet", "career/reviewed-packet-v2.json",
      "--baseline", "career", "--output", "v2", "--template", "material-profile");
    assert.equal(again.state, "unchanged");
    await handoff(first); // re-preparing the same handoff must succeed without rewriting it
    const record = JSON.parse(await readFile(join(first, "career", "generation-record.json"), "utf8"));
    assert.equal(record.preview.outputPath, "public", "approval records relative paths");
  } finally {
    await Promise.all([rm(first, { recursive: true, force: true }), rm(second, { recursive: true, force: true })]);
  }
});

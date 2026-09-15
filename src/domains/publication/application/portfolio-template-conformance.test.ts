import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const checker = resolve("skills/output-career-portfolio/scripts/check-template.mjs");
const shell = `<!doctype html><html><head><link rel="stylesheet" href="styles.css"><script src="app.js" defer></script></head><body>
<a href="#content">Skip</a><nav role="tablist"><button role="tab">Experience</button><button role="tab">Expertise</button><button role="tab">Graph</button><button role="tab">Evidence</button></nav>
<main id="content"><section class="profile"></section><div id="graph-list"></div><div id="evidence-body"></div></main><aside id="drawer" aria-label="Entity explorer"></aside></body></html>`;

test("local portfolio updates keep the approved shell unless a template revision is approved", async () => {
  const root = await mkdtemp(join(tmpdir(), "why-hire-me-template-"));
  const old = join(root, "old");
  const next = join(root, "next");
  try {
    await mkdir(old);
    await mkdir(next);
    for (const directory of [old, next]) {
      await writeFile(join(directory, "index.html"), shell);
      await writeFile(join(directory, "styles.css"), "body{color:#18202a}");
      await writeFile(join(directory, "app.js"), "console.log('template')");
    }
    const check = (revision?: string) => spawnSync(process.execPath, [checker,
      "--baseline", old, "--candidate", next, ...(revision ? ["--revision", revision] : [])],
      { encoding: "utf8" });

    let result = check();
    assert.equal(result.status, 0);
    assert.equal(JSON.parse(result.stdout).status, "passed");

    await writeFile(join(next, "index.html"), shell.replace("</nav>", "<a href=\"#contact\">Contact</a></nav>"));
    result = check();
    assert.equal(result.status, 1);
    assert.match(result.stdout, /Contact navigation points to a section without an actionable contact link/);
    await writeFile(join(next, "index.html"), shell);

    await writeFile(join(next, "styles.css"), "body{color:magenta}");
    result = check();
    assert.equal(result.status, 1);
    assert.match(result.stdout, /Unapproved template asset changes: styles\.css/);

    const revision = join(root, "revision.json");
    await writeFile(revision, JSON.stringify({ schema: "why-hire-me.template-revision/v1",
      approvedByPerson: true, changedAssets: [{ path: "styles.css", rationale: "Reviewed contrast change",
        personApproved: true }] }));
    result = check(revision);
    assert.equal(result.status, 0);
    assert.equal(JSON.parse(result.stdout).changedAssets[0], "styles.css");

    await writeFile(join(next, "index.html"), shell.replace("<button role=\"tab\">Evidence</button>", ""));
    result = check(revision);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /missing Evidence tab/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

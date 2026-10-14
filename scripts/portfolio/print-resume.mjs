import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { renderResumeHtml } from "../../dist/adapters/publication/resume-html.js";

const usage = "Usage: node scripts/portfolio/print-resume.mjs --portfolio <generated-portfolio-dir> --output <resume.pdf|resume.html> [--browser <chrome-or-chromium-path>]\n";
let options;
try {
  ({ values: options } = parseArgs({ args: process.argv.slice(2).filter(arg => arg !== "--"),
    options: { portfolio: { type: "string" }, output: { type: "string" }, browser: { type: "string" } } }));
} catch (error) {
  process.stderr.write(`${error.message}\n${usage}`);
  process.exit(2);
}
if (!options.portfolio || !options.output) {
  process.stderr.write(usage);
  process.exit(2);
}

// The portfolio embeds its reviewed display model, so the résumé never needs a second input.
const data = JSON.parse(await readFile(join(resolve(options.portfolio), "portfolio.json"), "utf8"));
if (!data.displayModel) throw new Error("portfolio.json has no displayModel; regenerate the portfolio first.");
const html = renderResumeHtml(data.displayModel);
const output = resolve(options.output);
if (output.endsWith(".html")) {
  await writeFile(output, html);
  process.stdout.write(`${JSON.stringify({ output, format: "html" })}\n`);
  process.exit(0);
}

const CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
];
const browser = options.browser ?? CANDIDATES.find(path => path && existsSync(path));
if (!browser) throw new Error("No Chrome or Chromium found; pass --browser <path> or set CHROME_PATH, or use --output resume.html and print it yourself.");

const work = await mkdtemp(join(tmpdir(), "why-hire-me-resume-"));
try {
  const page = join(work, "resume.html");
  await writeFile(page, html);
  // A local file and no network: the page has no remote resources and a CSP that blocks them.
  execFileSync(browser, ["--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--no-first-run",
    `--user-data-dir=${join(work, "profile")}`, `--print-to-pdf=${output}`, pathToFileURL(page).href], { stdio: "ignore" });
} finally {
  await rm(work, { recursive: true, force: true });
}
if (!existsSync(output)) throw new Error(`The browser did not write ${output}.`);
process.stdout.write(`${JSON.stringify({ output, format: "pdf", browser })}\n`);

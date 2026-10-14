import type {
  CareerPortfolioDisplayItem as Item,
  CareerPortfolioDisplayModel,
} from "../../domains/publication/domain/career-portfolio-display.js";
import { careerProfileView, type ProfileRef } from "./career-profile-view.js";

const esc = (value: string) => value.replace(/[&<>"']/g, character =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);

/** How much each résumé length shows; every length keeps every role, so the career line stays whole. */
const DEPTH = {
  "one-page": { summaries: false, moreWork: false, moreSummaries: false, results: 0 },
  "two-pages": { summaries: true, moreWork: false, moreSummaries: false, results: 2 },
  "three-pages": { summaries: true, moreWork: true, moreSummaries: false, results: 3 },
  complete: { summaries: true, moreWork: true, moreSummaries: true, results: Infinity },
} as const;

const STYLES = `@page{size:A4;margin:12mm 14mm}*{box-sizing:border-box}
body{margin:0;font:9.5pt/1.36 "Helvetica Neue",Helvetica,Arial,sans-serif;color:#1b1f24}
h1{margin:0;font-size:21pt;letter-spacing:-.01em}h2{margin:14pt 0 5pt;padding-bottom:2pt;border-bottom:1px solid #c9ced6;
font-size:9pt;letter-spacing:.09em;text-transform:uppercase;color:#4a5260}
.contact{margin:3pt 0 0;color:#4a5260}.contact a{color:inherit}.headline{margin:7pt 0 0}
.role{margin:0 0 9pt;break-inside:avoid-page}.role-head{display:flex;justify-content:space-between;gap:12pt}
.role-head strong{font-size:10.5pt}.period{color:#4a5260;white-space:nowrap}.role-summary{margin:1pt 0 3pt;color:#3a414c}
ul{margin:2pt 0 0;padding-left:13pt}li{margin:0 0 2pt}.results{color:#3a414c}
.skills p{margin:0 0 2pt}.skills strong{font-weight:600}a{text-decoration:none}`;

/**
 * A print-ready résumé page built from the same reviewed display model as the portfolio. It adds no
 * wording of its own: every line is a record name or approved summary, ordered by inclusion priority.
 */
export function renderResumeHtml(display: CareerPortfolioDisplayModel): string {
  const view = careerProfileView(display);
  const depth = DEPTH[display.resumeLength];
  const byId = new Map<string, Item>(display.items.map(item => [item.id, item]));
  const impact = new Set(view.impact.map(ref => ref.id));
  const line = (ref: ProfileRef, summarise: boolean) => {
    const summary = summarise ? byId.get(ref.id)?.summary : null;
    return `<li><strong>${esc(ref.name)}</strong>${summary ? ` — ${esc(summary)}` : ""}</li>`;
  };
  const roles = view.roles.map(role => {
    const work = [...role.featuredWork.map(ref => line(ref, depth.summaries)),
      ...depth.moreWork ? role.moreWork.map(ref => line(ref, depth.moreSummaries)) : []];
    // Selected impact is listed once at the top, not again under its role.
    const results = role.outcomes.filter(ref => !impact.has(ref.id)).slice(0, depth.results);
    return `<section class="role"><div class="role-head"><strong>${esc(role.title)}${role.organisation
      ? ` · ${esc(role.organisation)}` : ""}</strong>${role.period ? `<span class="period">${esc(role.period)}</span>` : ""}</div>${
      depth.summaries && role.summary ? `<p class="role-summary">${esc(role.summary)}</p>` : ""}${
      work.length ? `<ul>${work.join("")}</ul>` : ""}${
      results.length ? `<ul class="results">${results.map(ref => `<li>${esc(ref.name)}</li>`).join("")}</ul>` : ""}</section>`;
  }).join("");
  const skills = view.categories.map(category =>
    `<p><strong>${esc(category.name)}:</strong> ${category.technologies.map(item => esc(item.name)).join(", ")}</p>`).join("");
  const contact = [view.location ? esc(view.location) : "",
    view.linkedInUrl ? `<a href="${esc(view.linkedInUrl)}">${esc(view.linkedInUrl.replace(/^https?:\/\/(www\.)?/, ""))}</a>` : ""]
    .filter(Boolean).join(" · ");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
<title>${esc(view.name)} · Résumé</title><style>${STYLES}</style></head><body>
<header><h1>${esc(view.name)}</h1>${contact ? `<p class="contact">${contact}</p>` : ""}${
    view.headline ? `<p class="headline">${esc(view.headline)}</p>` : ""}</header>
${view.impact.length ? `<h2>Selected impact</h2><ul>${view.impact.map(ref => `<li>${esc(ref.name)}</li>`).join("")}</ul>` : ""}
<h2>Experience</h2>${roles}
${skills ? `<h2>Skills</h2><div class="skills">${skills}</div>` : ""}
${view.credentials.length ? `<h2>Credentials</h2><ul>${view.credentials.map(ref => `<li>${esc(ref.name)}</li>`).join("")}</ul>` : ""}
</body></html>
`;
}

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type {
  CareerPortfolioOptions,
  CareerPortfolioProjection,
  ValidatedKnowledgeRelease,
} from "../../domains/publication/domain/career-portfolio.js";
import type { CareerPortfolioDisplayModel } from "../../domains/publication/domain/career-portfolio-display.js";
import type { PortfolioInclusionDecision } from "../../domains/publication/domain/career-portfolio-selection.js";
import type { CareerPortfolioRenderer } from "../../domains/publication/ports/career-portfolio-ports.js";
import type { ReleaseDigester } from "../../domains/publication/ports/knowledge-release-ports.js";
import { careerProfileView, type CareerProfileView, type ProfilePlace, type ProfileRef, type ProfileRole } from "./career-profile-view.js";
import { technologyBadge, technologyGlyph } from "./technology-icons.js";
import { portfolioProjection, releaseDisplayModel } from "./static-html-career-portfolio-renderer.js";

const templateDirectory = join(dirname(fileURLToPath(import.meta.url)), "../../../templates/career-portfolio/material-profile");
const localRequire = createRequire(import.meta.url);
const stylesSource = readFileSync(join(templateDirectory, "styles.css"), "utf8");
const appSource = readFileSync(join(templateDirectory, "app.js"), "utf8");
const cytoscapeSource = readFileSync(join(dirname(localRequire.resolve("cytoscape")), "cytoscape.min.js"), "utf8");
const RENDERER_VERSION = "1.0.0";
const GITHUB_URL = "https://github.com/rajanrx/why-hire-me";

const esc = (value: string) => value.replace(/[&<>"']/g, character =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
const fragment = (prefix: string, id: string) => `#${prefix}/${encodeURIComponent(id)}`;
const recordLink = (item: ProfileRef, className = "record-link") =>
  `<a class="${className}" href="${fragment("entity", item.id)}">${esc(item.name)}</a>`;
const initials = (value: string) =>
  value.split(/[\s·&/-]+/).filter(word => /^[\p{L}\p{N}]/u.test(word)).slice(0, 2).map(word => word[0]!.toUpperCase()).join("") || "•";

/** Lucide outline icons (ISC), read from the pinned package and inlined so the page makes no request. */
const LUCIDE = {
  home: "house", work: "briefcase-business", skills: "layers", explore: "waypoints", ask: "sparkles",
  download: "download", theme: "moon", arrow: "arrow-right", back: "arrow-left", close: "x", copy: "copy",
  open: "external-link", menu: "panel-left", impact: "trending-up", fullscreen: "maximize-2",
} as const;
const lucideDirectory = join(dirname(localRequire.resolve("lucide-static/package.json")), "icons");
const lucideInner = new Map(Object.entries(LUCIDE).map(([name, file]) => {
  const svg = readFileSync(join(lucideDirectory, `${file}.svg`), "utf8");
  return [name, svg.slice(svg.indexOf(">", svg.indexOf("<svg")) + 1, svg.lastIndexOf("</svg>")).replace(/\s+/g, " ").trim()];
}));
const icon = (name: keyof typeof LUCIDE | "linkedin") => name === "linkedin"
  ? `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="${LINKEDIN_PATH}"/></svg>`
  : `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${lucideInner.get(name)}</svg>`;
/** Matte colours per record kind, shared by the graph nodes and the legend. */
const GRAPH_KINDS = {
  where: { colour: "#7e6ba8", icon: "building-2" }, built: { colour: "#4f7cac", icon: "briefcase-business" },
  achieved: { colour: "#4e8f6f", icon: "trending-up" }, tool: { colour: "#b08850", icon: "cpu" },
  other: { colour: "#8a8f98", icon: "circle-dot" },
} as const;
/** Each kind's Lucide icon as an SVG data URI in its matte colour, for use as a graph node image. */
const graphIcons = Object.fromEntries(Object.entries(GRAPH_KINDS).map(([kind, { colour, icon: file }]) => {
  const svg = readFileSync(join(lucideDirectory, `${file}.svg`), "utf8");
  const inner = svg.slice(svg.indexOf(">", svg.indexOf("<svg")) + 1, svg.lastIndexOf("</svg>")).replace(/\s+/g, " ").trim();
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="${colour}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  return [kind, { colour, image: `data:image/svg+xml;utf8,${encodeURIComponent(markup)}` }];
}));
/** LinkedIn glyph (Simple Icons dropped the brand); the same mark the editorial template uses. */
const LINKEDIN_PATH = "M5.3 3.8A2.3 2.3 0 1 1 5.3 8.4 2.3 2.3 0 0 1 5.3 3.8ZM3.4 10h3.8v10.6H3.4V10Zm6.2 0h3.6v1.5h.1c.5-.9 1.8-1.9 3.7-1.9 3.9 0 4.6 2.5 4.6 5.9v5.1h-3.8v-4.5c0-1.1 0-3-1.9-3-1.9 0-2.2 1.4-2.2 2.9v4.6H9.6V10Z";
/** Roboto Flex (OFL-1.1), Latin variable-weight subset, embedded so typography never needs the network. */
const fontFace = `@font-face{font-family:"Roboto Flex";font-style:normal;font-display:swap;font-weight:100 1000;src:url(data:font/woff2;base64,${
  readFileSync(join(dirname(localRequire.resolve("@fontsource-variable/roboto-flex/package.json")), "files/roboto-flex-latin-wght-normal.woff2")).toString("base64")}) format("woff2-variations");}\n`;

/** Decorative thumbnail: the role at the centre, its work, results, and tools around it. */
function connectionThumbnail(role: ProfileRole): string {
  const kinds = [...role.featuredWork, ...role.moreWork].map(() => "built")
    .concat(role.outcomes.map(() => "achieved"), role.technologies.map(() => "tool")).slice(0, 10);
  const dots = kinds.map((kind, index) => {
    const angle = (2 * Math.PI * index) / Math.max(kinds.length, 1) - Math.PI / 2;
    const x = (39 + 28 * Math.cos(angle)).toFixed(1), y = (28 + 20 * Math.sin(angle)).toFixed(1);
    return `<line x1="39" y1="28" x2="${x}" y2="${y}"/><circle class="k-${kind}" cx="${x}" cy="${y}" r="4.5"/>`;
  }).join("");
  return `<svg class="thumb" viewBox="0 0 78 56" aria-hidden="true">${dots}<circle class="k-focus" cx="39" cy="28" r="8"/></svg>`;
}

/** Company logo when an approved one exists; initials are the last resort. */
const avatar = (role: ProfileRole): string => role.logo
  ? `<span class="avatar logo"><img src="${esc(role.logo)}" alt="" width="30" height="30"></span>`
  : `<span class="avatar">${esc(initials(role.organisation || role.title))}</span>`;

/** Technology id -> icon path, so server-rendered and runtime chips share the same marks. */
function technologyIcons(view: CareerProfileView): Map<string, string> {
  return new Map(view.categories.flatMap(category => category.technologies.map(tech =>
    [tech.id, technologyBadge(tech.name, category.id ? category.name : null)] as const)));
}
const techIcon = (badge: string | undefined) => badge ?? "";

/** Where a skill was used: one small logo (or initials) per role, each with its own hover card. */
const MAX_PLACES = 4;
function placeStack(places: readonly ProfilePlace[]): string {
  if (!places.length) return "";
  const label = places.map(place => place.organisation).join(", ");
  const mark = (place: ProfilePlace) => place.logo
    ? `<img src="${esc(place.logo)}" alt="" width="16" height="16">`
    : esc(initials(place.organisation));
  return `<span class="places" aria-label="Used at ${esc(label)}">${places.slice(0, MAX_PLACES).map(place =>
    `<span class="place${place.logo ? " has-logo" : ""}">${mark(place)}<span class="place-card" role="tooltip"><strong>${esc(place.organisation)}</strong><span>${esc([place.title, place.period].filter(Boolean).join(" · "))}</span>${place.summary ? `<span class="muted">${esc(place.summary)}</span>` : ""}</span></span>`).join("")}${places.length > MAX_PLACES ? `<span class="place more-places">+${places.length - MAX_PLACES}</span>` : ""}<span class="places-count">${places.length === 1 ? esc(places[0]!.organisation) : `${places.length} roles`}</span></span>`;
}

function roleDetail(role: ProfileRole, icons: Map<string, string>): string {
  const workCount = role.featuredWork.length + role.moreWork.length;
  const chips = role.technologies.map(tech =>
    `<a class="chip" href="${fragment("explore", tech.id)}">${techIcon(icons.get(tech.id))}${esc(tech.name)}${icon("explore")}<span class="visually-hidden">: explore connections</span></a>`).join("");
  const workItem = (item: ProfileRef) => `<li>${recordLink(item)}</li>`;
  return `<article class="role-detail card elevated" id="role-${esc(role.id)}" data-role="${esc(role.id)}" aria-labelledby="role-title-${esc(role.id)}">
<a class="back-to-list" href="#career">${icon("back")}All roles</a>
<p class="overline">${esc([role.organisation, role.period].filter(Boolean).join(" · "))}</p>
<h3 class="headline-small" id="role-title-${esc(role.id)}">${esc(role.title)}</h3>
${role.summary ? `<p class="body-large muted">${esc(role.summary)}</p>` : ""}
${role.outcomes.length ? `<h4 class="title-small">Results</h4><ul class="tiles">${role.outcomes.map(item => `<li><a class="tile" href="${fragment("entity", item.id)}">${esc(item.name)}</a></li>`).join("")}</ul>` : ""}
${role.featuredWork.length ? `<h4 class="title-small">Key work</h4><ul class="work-list">${role.featuredWork.map(workItem).join("")}</ul>` : ""}
${role.moreWork.length ? `<details class="more"><summary>Show ${role.moreWork.length} more ${role.moreWork.length === 1 ? "piece" : "pieces"} of work</summary><ul class="work-list">${role.moreWork.map(workItem).join("")}</ul></details>` : ""}
${chips ? `<h4 class="title-small">Technologies</h4><div class="chips">${chips}</div>` : ""}
<a class="connect-card" href="${fragment("explore", role.id)}">${connectionThumbnail(role)}<span><strong>See how this role connects</strong><span class="muted">${workCount} work · ${role.outcomes.length} results · ${role.technologies.length} technologies</span></span><span class="connect-go">${icon("arrow")}</span></a>
</article>`;
}

function renderHtml(display: CareerPortfolioDisplayModel): string {
  const view = careerProfileView(display);
  const techIcons = technologyIcons(view);
  const name = esc(view.name);
  const current = view.roles[0];
  const askButton = (className: string, label: string) => view.notebookUrl
    ? `<a class="${className}" href="${esc(view.notebookUrl)}" target="_blank" rel="noopener noreferrer">${icon("ask")}<span>${label}</span><span class="visually-hidden"> (opens an external AI notebook in a new tab)</span></a>` : "";
  const destinations: [string, string, keyof typeof LUCIDE][] = [
    ["overview", "Overview", "home"], ["career", "Career", "work"], ["skills", "Skills", "skills"],
    ["explore", "Explore", "explore"], ...(view.notebookUrl || view.audioPath ? [["ask", "Ask", "ask"] as [string, string, keyof typeof LUCIDE]] : []),
  ];
  const nav = destinations.map(([id, label, glyph]) =>
    `<a class="nav-item" href="#${id}" data-nav="${id}">${icon(glyph)}<span>${label}</span></a>`).join("");
  const strongest = view.categories.slice(0, 6).map(category => category.id
    ? `<a class="chip" href="${fragment("explore", category.id)}">${esc(category.name)}${icon("explore")}</a>`
    : "").join("");
  const listen = view.audioPath
    ? `<a class="button tonal" href="#ask">${icon("ask")}<span>Listen to an AI summary</span></a>` : "";

  const overview = `<section class="destination" id="overview" data-destination="overview" aria-labelledby="overview-title">
<div class="hero">
<p class="overline">${esc([current?.title, current?.organisation, view.location].filter(Boolean).join(" · "))}</p>
<h1 class="display-small" id="overview-title">${name}</h1>
${view.headline ? `<p class="headline-text">${esc(view.headline)}</p>` : ""}
<div class="actions">${askButton("button filled", `Ask ${name}'s AI`)}${listen}<a class="button outlined" href="#career">${icon("work")}<span>View career</span></a></div>
</div>
<div class="overview-grid">
${view.roles.length ? `<div class="panel"><h2 class="title-medium">Recent roles</h2><ul class="role-cards">${view.roles.slice(0, 3).map(role => `<li><a class="role-card card" href="${fragment("career", role.id)}">${avatar(role)}<span><strong>${esc(role.title)}</strong><span class="muted">${esc([role.organisation, role.period].filter(Boolean).join(" · "))}</span></span>${icon("arrow")}</a></li>`).join("")}</ul></div>` : ""}
${view.impact.length ? `<div class="panel"><h2 class="title-medium">Impact</h2><ul class="tiles impact">${view.impact.map(item => `<li><a class="tile" href="${fragment("entity", item.id)}"><span class="tile-icon">${icon("impact")}</span><span>${esc(item.name)}</span></a></li>`).join("")}</ul></div>` : ""}
</div>
${strongest ? `<h2 class="title-medium">Explore by area</h2><div class="chips">${strongest}</div>` : ""}
</section>`;

  const career = `<section class="destination" id="career" data-destination="career" aria-labelledby="career-title">
<h2 class="headline-small" id="career-title">Career</h2>
${view.roles.length ? `<div class="list-detail"><ul class="role-list" aria-label="Roles">${view.roles.map(role => `<li><a class="role-card card" href="${fragment("career", role.id)}" data-role-link="${esc(role.id)}">${avatar(role)}<span><strong>${esc(role.title)}</strong><span class="muted">${esc([role.organisation, role.period].filter(Boolean).join(" · "))}</span></span></a></li>`).join("")}</ul>
<div class="role-details">${view.roles.map(role => roleDetail(role, techIcons)).join("")}</div></div>` : `<p class="muted">No roles are included in this portfolio.</p>`}
${view.credentials.length ? `<h3 class="title-large">Education, credentials &amp; publications</h3><ul class="work-list">${view.credentials.map(item => `<li>${recordLink(item)}</li>`).join("")}</ul>` : ""}
</section>`;

  const skills = `<section class="destination" id="skills" data-destination="skills" aria-labelledby="skills-title">
<h2 class="headline-small" id="skills-title">Skills</h2>
${view.categories.length ? view.categories.map(category => `<section class="skill-group card"><h3 class="title-medium">${esc(category.name)}</h3><ul class="skill-list">${category.technologies.map(tech => `<li><a class="skill-row" href="${fragment("explore", tech.id)}">${techIcon(techIcons.get(tech.id))}<span class="skill-name">${esc(tech.name)}</span>${placeStack(tech.usedAt)}</a></li>`).join("")}</ul></section>`).join("") : `<p class="muted">No technologies are included in this portfolio.</p>`}
</section>`;

  const explore = `<section class="destination" id="explore" data-destination="explore" aria-labelledby="explore-title">
<h2 class="headline-small" id="explore-title">Explore</h2>
<div class="search"><label for="explore-search">Show me where ${name} used…</label><input id="explore-search" type="search" autocomplete="off" placeholder="Search a skill, company, or piece of work" aria-controls="explore-suggestions"></div>
<div id="explore-suggestions" class="chips" aria-live="polite"></div>
<div id="explore-result" aria-live="polite"><p class="muted">Pick an area above, or search, to see where it was used, what was built, and what it achieved.</p></div>
<div id="focused-graph" class="graph-panel" hidden><div class="graph-bar"><nav id="graph-trail" class="trail" aria-label="Graph history"></nav><span class="graph-actions"><button class="button text" type="button" id="graph-fullscreen" aria-pressed="false">${icon("fullscreen")}<span>Full screen</span></button><a class="button text" id="graph-exit" href="#explore">${icon("close")}<span>Close graph</span></a></span></div><div class="graph-body"><div id="graph-canvas" class="graph-canvas" role="img" aria-label="Focused career graph. The panel lists the same connections as text."></div><aside id="graph-node" class="graph-node-panel card" aria-live="polite"></aside></div><p class="legend"><span class="k-where">Company or role</span><span class="k-built">Work</span><span class="k-achieved">Result</span><span class="k-tool">Technology</span></p></div>
<p><a class="button outlined" href="#records">Browse all records</a></p>
</section>`;

  const records = `<section class="destination" id="records" data-destination="records" aria-labelledby="records-title">
<h2 class="headline-small" id="records-title">All records</h2>
<p class="muted">Every approved record and every explicit relationship in this portfolio.</p>
<div class="search"><label for="records-search">Filter records</label><input id="records-search" type="search" autocomplete="off"></div>
<div class="table-wrap"><table><thead><tr><th scope="col">Record</th><th scope="col">Type</th><th scope="col">Use</th></tr></thead><tbody id="records-body">${display.items.map(item => `<tr><td>${recordLink(item)}</td><td>${esc(item.type)}</td><td>${esc(item.inclusion?.status ?? "context")}</td></tr>`).join("")}</tbody></table></div>
<h3 class="title-large">Relationships</h3>
<ul id="relationship-list" class="relationship-list">${display.relations.map(relation => {
    const subject = display.items.find(item => item.id === relation.subject), object = display.items.find(item => item.id === relation.object);
    return subject && object ? `<li>${recordLink(subject)} <span class="muted">${esc(relation.predicate)}</span> ${recordLink(object)}</li>` : "";
  }).join("") || "<li>No explicit relationships are present; none have been invented.</li>"}</ul>
${display.limitations.length ? `<p class="muted label-small">${display.limitations.map(esc).join(" · ")}</p>` : ""}
</section>`;

  const ask = view.notebookUrl || view.audioPath ? `<section class="destination" id="ask" data-destination="ask" aria-labelledby="ask-title">
<h2 class="headline-small" id="ask-title">Ask</h2>
${view.notebookUrl ? `<div class="ask-card card"><h3 class="title-large">Chat with an AI that has read ${name}'s career record</h3><p>It answers from the same approved portfolio shown here. It opens in an external service, which may ask you to sign in.</p>${askButton("button filled", "Open the AI notebook")}
<h4 class="title-small">Questions to try</h4><ul class="questions">${[
    current ? `What did ${view.name} lead as ${current.title}${current.organisation ? ` at ${current.organisation}` : ""}?` : null,
    view.categories[0]?.technologies[0] ? `Where has ${view.name} used ${view.categories[0].technologies[0].name}, and what came of it?` : null,
    `What are ${view.name}'s strongest areas, with evidence?`,
    `Which results is ${view.name} most proud of, and what was their part?`,
  ].filter((question): question is string => question !== null).map(question => `<li><span>${esc(question)}</span><button class="icon-button" type="button" data-copy="${esc(question)}" aria-label="Copy question">${icon("copy")}</button></li>`).join("")}</ul></div>` : ""}
${view.audioPath ? `<div class="ask-card card"><h3 class="title-large">Listen to an AI-generated summary</h3><p class="muted">Generated from this portfolio by an AI tool. It is a summary, not the career record itself.</p><audio controls preload="none" src="${esc(view.audioPath)}"></audio></div>` : ""}
</section>` : "";

  const resume = view.resumePath
    ? `<a class="button outlined compact" href="${esc(view.resumePath)}" download>${icon("download")}<span>Résumé</span></a>` : "";
  const linkedIn = view.linkedInUrl
    ? `<a class="icon-button" href="${esc(view.linkedInUrl)}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile">${icon("linkedin")}</a>` : "";
  const csp = `default-src 'none'; style-src 'self'; script-src 'self'; img-src 'self' data:;${view.audioPath ? " media-src 'self';" : ""} font-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'`;
  const data = JSON.stringify({ items: display.items, relations: display.relations, links: display.links,
    technologyIcons: Object.fromEntries(techIcons),
    graphKinds: graphIcons,
    technologyGlyphs: Object.fromEntries(view.categories.flatMap(category => category.technologies.map(tech =>
      [tech.id, technologyGlyph(tech.name, category.id ? category.name : null)]))),
    logos: Object.fromEntries(display.assets.flatMap(asset => asset.kind === "logo" && asset.targetRecordId ? [[asset.targetRecordId, asset.outputPath]] : [])) })
    .replace(/</g, "\\u003c");

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="generator" content="why-hire-me.build/v1"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta http-equiv="Content-Security-Policy" content="${csp}"><link rel="icon" href="data:,"><title>${name} · Career profile</title><link rel="stylesheet" href="styles.css"></head>
<body class="resume-${esc(display.resumeLength)}" data-template="material-profile">
<a class="skip" href="#content">Skip to content</a>
<header class="top-bar"><button class="icon-button nav-toggle" type="button" id="nav-toggle" aria-controls="site-nav" aria-expanded="true" aria-label="Collapse navigation">${icon("menu")}</button><a class="brand" href="#overview">${name}</a><div class="top-actions"><button class="icon-button" type="button" id="theme-toggle" aria-label="Switch between light and dark theme">${icon("theme")}</button>${linkedIn}${resume}${askButton("button filled compact ask-top", "Ask AI")}</div></header>
<nav class="nav" id="site-nav" aria-label="Sections"><a class="nav-brand" href="#overview"><span class="avatar">${esc(initials(view.name))}</span><span class="nav-brand-text"><strong>${name}</strong><span>Career profile</span></span></a>${nav}</nav>
<main id="content" tabindex="-1">${overview}${career}${skills}${explore}${records}${ask}</main>
${askButton("fab", "Ask")}
<div class="sheet-scrim" id="sheet-scrim" hidden></div>
<section class="sheet" id="record-sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" hidden><div class="sheet-bar"><button class="icon-button" type="button" id="sheet-close" aria-label="Close record">${icon("close")}</button></div><div id="sheet-body" class="sheet-body"></div></section>
<footer class="footer label-medium">Made with <a href="${GITHUB_URL}">Why Hire Me</a> · Offline by default · No analytics or network requests</footer>
<script type="application/json" id="portfolio-data">${data}</script>
<script src="app.js"></script>
</body></html>
`;
}

export class MaterialCareerPortfolioRenderer implements CareerPortfolioRenderer {
  public constructor(private readonly digester: ReleaseDigester) {}

  public render(release: ValidatedKnowledgeRelease, inclusionDecisions: readonly PortfolioInclusionDecision[],
    options: CareerPortfolioOptions): CareerPortfolioProjection {
    return this.renderDisplayModel(releaseDisplayModel(release, inclusionDecisions, options), inclusionDecisions);
  }

  public renderDisplayModel(display: CareerPortfolioDisplayModel,
    inclusionDecisions: readonly PortfolioInclusionDecision[]): CareerPortfolioProjection {
    const files = Object.freeze({
      "index.html": renderHtml(display),
      "styles.css": fontFace + stylesSource,
      "app.js": `${cytoscapeSource}\n${appSource}`,
      "portfolio.json": `${JSON.stringify({ schema: "why-hire-me.portfolio-data/v0.4",
        buildMarker: "why-hire-me.build/v1", displayModel: display }, null, 2)}\n`,
    });
    return portfolioProjection(files, display, inclusionDecisions, this.digester, RENDERER_VERSION, "material-profile");
  }
}

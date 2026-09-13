import type { CareerPortfolioProjection, ValidatedKnowledgeRelease } from "../../domains/publication/domain/career-portfolio.js";
import type { ReleaseInputRecord } from "../../domains/publication/domain/knowledge-release.js";
import type { CareerPortfolioRenderer } from "../../domains/publication/ports/career-portfolio-ports.js";
import type { ReleaseDigester } from "../../domains/publication/ports/knowledge-release-ports.js";

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function entityData(record: ReleaseInputRecord): { type: string; name: string } {
  const data = typeof record.data === "object" && record.data !== null ? record.data as Record<string, unknown> : {};
  const attributes = typeof data.attributes === "object" && data.attributes !== null ? data.attributes as Record<string, unknown> : {};
  return { type: typeof data.entityType === "string" ? data.entityType : "Career record",
    name: typeof attributes.displayName === "string" ? attributes.displayName : record.id };
}

export class StaticHtmlCareerPortfolioRenderer implements CareerPortfolioRenderer {
  public constructor(private readonly digester: ReleaseDigester) {}

  public render(release: ValidatedKnowledgeRelease): CareerPortfolioProjection {
    const entities = release.records.filter((record) => record.recordType === "Entity");
    const evidence = release.records.filter((record) => record.recordType === "Evidence");
    const activities = release.records.filter((record) => record.recordType === "Activity");
    const items = entities.map((record) => ({ id: record.id, ...entityData(record), recordedAt: record.recordedAt }));
    const list = items.length === 0 ? "<li>No career records were included in this authorised view.</li>" :
      items.map((item) => `<li><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.type)}</span></li>`).join("");
    const resumeList = items.length === 0 ? "<li>No career records were included in this authorised view.</li>" :
      items.map((item) => `<li><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.type)}</span></li>`).join("");
    const nodes = items.slice(0, 18).map((item, index) => {
      const column = index % 3; const row = Math.floor(index / 3); const x = 20 + column * 210; const y = 20 + row * 72;
      return `<g transform="translate(${x} ${y})"><rect width="188" height="52" rx="12"/><text x="12" y="22">${escapeHtml(item.name.slice(0, 24))}</text><text class="node-type" x="12" y="40">${escapeHtml(item.type)}</text></g>`;
    }).join("");
    const limitations = release.manifest.limitations.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    const evidenceList = evidence.length === 0
      ? "<li>No evidence records were included in this authorised release.</li>"
      : evidence.map((record) => `<li><strong>${escapeHtml(record.id)}</strong><span>${escapeHtml(JSON.stringify(record.data))}</span></li>`).join("");
    const title = escapeHtml(release.manifest.subject.displayName);
    const portfolioJson = `${JSON.stringify({ schema: "why-hire-me.portfolio-data/v0.1", release: release.manifest,
      entities: items, records: release.records }, null, 2)}\n`;
    const height = Math.max(120, Math.ceil(Math.max(items.length, 1) / 3) * 72 + 20);
    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; form-action 'none'">
<title>${title} · Career portfolio</title><style>
:root{color-scheme:light dark;--bg:#f6f2e9;--ink:#18201d;--muted:#53615b;--card:#fffdf8;--line:#c9d1ca;--accent:#0b6b4f}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 system-ui,sans-serif}.skip{position:absolute;left:-9999px}.skip:focus{left:1rem;top:1rem;background:var(--card);padding:.6rem;z-index:2}header,main,footer{width:min(1040px,calc(100% - 2rem));margin:auto}header{padding:5rem 0 2rem;border-bottom:1px solid var(--line);animation:rise .55s ease-out both}.eyebrow{color:var(--accent);font-weight:700;letter-spacing:.08em;text-transform:uppercase}h1{font-size:clamp(2.7rem,8vw,6rem);line-height:.95;margin:.25rem 0 1rem;letter-spacing:-.055em}h2{font-size:1.6rem;margin-top:3rem}section{margin:2rem 0;animation:rise .55s .08s ease-out both}.lede{font-size:1.2rem;max-width:65ch;color:var(--muted)}svg{display:block;width:100%;height:auto;background:var(--card);border:1px solid var(--line);border-radius:18px}svg g,.records li{transition:transform .16s ease,border-color .16s ease}svg g:hover{transform:translateY(-2px)}svg rect{fill:var(--bg);stroke:var(--line)}svg text{fill:var(--ink);font-size:13px;font-weight:650}.node-type{fill:var(--muted);font-size:11px;font-weight:400}.records{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.75rem;padding:0;list-style:none}.records li{display:flex;flex-direction:column;padding:1rem;background:var(--card);border:1px solid var(--line);border-radius:12px}.records li:hover{transform:translateY(-2px);border-color:var(--accent)}.records span,.meta{color:var(--muted);font-size:.9rem}.notice{border-left:4px solid var(--accent);padding:.2rem 1rem;background:var(--card)}footer{padding:2rem 0 4rem;border-top:1px solid var(--line)}@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}@media(prefers-color-scheme:dark){:root{--bg:#111715;--ink:#eef5f0;--muted:#aab8b0;--card:#19221e;--line:#39463f;--accent:#71d5b2}}@media print{body{background:#fff;color:#000}header{padding:1rem 0}svg{break-inside:avoid}.skip{display:none}}
svg g:hover{transform:none}
</style></head><body><a class="skip" href="#content">Skip to career overview</a><header><p class="eyebrow">Evidence-aware career portfolio</p><h1>${title}</h1><p class="lede">A person-reviewed view of career knowledge, prepared for ${escapeHtml(release.manifest.purpose)}.</p></header>
<main id="content"><section aria-labelledby="overview"><h2 id="overview">Career overview</h2><p>This portfolio contains ${items.length} accepted career ${items.length === 1 ? "record" : "records"}. It is a projection of release <code>${escapeHtml(release.manifest.releaseId)}</code>, not a live profile.</p></section>
<section aria-labelledby="graph"><h2 id="graph">Career knowledge map</h2><svg role="img" aria-labelledby="graph-title graph-description" viewBox="0 0 650 ${height}"><title id="graph-title">Career knowledge map</title><desc id="graph-description">A visual map of the same career records listed immediately below.</desc>${nodes}</svg><h3>Equivalent record list</h3><ul class="records">${list}</ul></section>
<section aria-labelledby="resume"><h2 id="resume">Résumé view</h2><ul class="records">${resumeList}</ul></section>
<section aria-labelledby="evidence"><h2 id="evidence">Evidence and provenance</h2><p>${evidence.length} evidence ${evidence.length === 1 ? "record" : "records"} and ${activities.length} provenance ${activities.length === 1 ? "activity" : "activities"} are included.</p><ul class="records">${evidenceList}</ul></section>
<section class="notice" aria-labelledby="limits"><h2 id="limits">Scope and limitations</h2><ul>${limitations}</ul><p class="meta">View expires ${escapeHtml(release.manifest.view.expiresAt)}. Public copies may remain after expiry.</p></section></main>
<footer><p class="meta">Release ${escapeHtml(release.manifest.releaseId)} · Generated with renderer 0.1.0 · No analytics or required network resources.</p></footer></body></html>\n`;
    const files = Object.freeze({ "index.html": html, "portfolio.json": portfolioJson });
    const fileManifest = (["index.html", "portfolio.json"] as const).map((path) => Object.freeze({ path,
      bytes: Buffer.byteLength(files[path]), sha256: this.digester.sha256(files[path]) }));
    const projectionDigest = this.digester.sha256(JSON.stringify({ schema: "why-hire-me.portfolio/v0.1",
      rendererVersion: "0.1.0", releaseId: release.manifest.releaseId,
      releaseDigest: release.manifest.releaseDigest, authorisationExpiresAt: release.manifest.view.expiresAt,
      generatedAt: release.manifest.createdAt,
      entryPoint: "index.html", files: fileManifest, limitations: release.manifest.limitations }));
    const portfolioId = `portfolio-${projectionDigest.slice(0, 24)}`;
    return Object.freeze({ files, manifest: Object.freeze({ schema: "why-hire-me.portfolio/v0.1",
      portfolioId, projectionDigest, rendererVersion: "0.1.0", releaseId: release.manifest.releaseId,
      releaseDigest: release.manifest.releaseDigest, authorisationExpiresAt: release.manifest.view.expiresAt,
      generatedAt: release.manifest.createdAt,
      entryPoint: "index.html", files: Object.freeze(fileManifest),
      limitations: Object.freeze([...release.manifest.limitations]) }) });
  }
}

import type {
  CareerPortfolioOptions,
  CareerPortfolioProjection,
  ValidatedKnowledgeRelease,
} from "../../domains/publication/domain/career-portfolio.js";
import type { PortfolioInclusionDecision } from "../../domains/publication/domain/career-portfolio-selection.js";
import type { ReleaseInputRecord } from "../../domains/publication/domain/knowledge-release.js";
import type { CareerPortfolioDisplayModel, CareerPortfolioDisplayItem, CareerPortfolioDisplayRelation } from "../../domains/publication/domain/career-portfolio-display.js";
import type { CareerPortfolioRenderer } from "../../domains/publication/ports/career-portfolio-ports.js";
import type { ReleaseDigester } from "../../domains/publication/ports/knowledge-release-ports.js";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { cytoscapeCareerGraphApp, cytoscapeCareerGraphLegendStyles, cytoscapeCareerGraphStyles } from "./cytoscape-career-graph-template.js";
import { mobileCareerGraphDetailApp } from "./mobile-career-graph-detail-template.js";

const localRequire = createRequire(import.meta.url);
const cytoscapeBrowserSource = readFileSync(
  join(dirname(localRequire.resolve("cytoscape")), "cytoscape.min.js"),
  "utf8",
);

const esc = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
const object = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const text = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

type PortfolioItem = CareerPortfolioDisplayItem;
type PortfolioRelation = CareerPortfolioDisplayRelation;

function itemFrom(
  record: ReleaseInputRecord,
  inclusion: PortfolioInclusionDecision | null,
): PortfolioItem {
  const data = object(record.data),
    attributes = object(data.attributes);
  const details = Object.entries(attributes)
    .filter(([key]) => !["displayName", "summary", "description"].includes(key))
    .flatMap(([key, value]) => {
      const rendered =
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
          ? String(value)
          : Array.isArray(value) &&
              value.every((part) => typeof part === "string")
            ? value.join(" · ")
            : null;
      return rendered === null
        ? []
        : [
            {
              label: key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (character) => character.toUpperCase()),
              value: rendered,
            },
          ];
    });
  const literal = object(data.object);
  const type =
    record.recordType === "Claim" && data.claimType === "reported-outcome"
      ? "Reported outcome"
      : record.recordType === "Evidence"
        ? "Evidence"
        : (text(data.entityType) ?? record.recordType);
  return Object.freeze({
    id: record.id,
    type,
    name:
      text(attributes.displayName) ??
      text(data.statement) ??
      text(literal.value) ??
      record.id,
    summary:
      text(attributes.summary) ??
      text(attributes.description) ??
      text(data.context),
    recordedAt: record.recordedAt,
    details: Object.freeze(details),
    inclusion,
  });
}

function relationFrom(record: ReleaseInputRecord): PortfolioRelation | null {
  const data = object(record.data),
    subject =
      text(data.subjectId) ??
      text(data.subject) ??
      text(object(data.subject).ref);
  const target =
    text(data.objectId) ?? text(data.object) ?? text(object(data.object).ref);
  return subject && target
    ? {
        id: record.id,
        subject,
        object: target,
        predicate:
          text(data.predicate) ?? text(data.predicateId) ?? "related to",
      }
    : null;
}

const styles = `:root{color-scheme:light;--paper:#fbfbfa;--surface:#fff;--ink:#18202a;--muted:#657080;--line:#dfe3e8;--soft:#f2f5f8;--blue:#1769aa;--blue-soft:#eaf3fb;--green:#26735c;--shadow:0 8px 30px rgba(24,32,42,.07);font:14px/1.55 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ink);background:var(--paper)}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0}a{color:var(--blue);text-underline-offset:3px}button,input,select{font:inherit;color:inherit}.skip{position:fixed;top:-60px;left:12px;z-index:40;background:var(--ink);color:#fff;padding:8px 12px}.skip:focus{top:8px}.topbar{height:58px;position:sticky;top:0;z-index:10;display:grid;grid-template-columns:minmax(180px,1fr) auto minmax(180px,1fr);align-items:center;padding:0 28px;border-bottom:1px solid var(--line);background:rgba(251,251,250,.96);backdrop-filter:blur(12px)}.wordmark{font-weight:720;color:var(--ink);text-decoration:none}.tabs{display:flex;height:100%;gap:4px}.tabs button{border:0;border-bottom:2px solid transparent;background:transparent;padding:0 13px;color:var(--muted);cursor:pointer}.tabs button[aria-selected=true],.tabs button:hover{color:var(--ink);border-color:var(--blue)}.release-id{justify-self:end;color:var(--muted);font-size:11px}.shell{max-width:1220px;margin:auto;padding:0 28px}.profile{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(300px,.6fr);gap:48px;padding:42px 0 32px;border-bottom:1px solid var(--line)}.overline{margin:0 0 6px;color:var(--blue);font-size:10px;font-weight:750;letter-spacing:.11em;text-transform:uppercase}.profile h1{margin:0;font-size:34px;line-height:1.1;letter-spacing:-.035em}.lead{max-width:720px;margin:12px 0 0;color:#344152;font-size:16px}.facts{display:grid;grid-template-columns:1fr 1fr;margin:0;border:1px solid var(--line);border-radius:8px;background:#fff}.facts div{padding:10px 13px;border-bottom:1px solid var(--line)}.facts div:nth-child(odd){border-right:1px solid var(--line)}dt{color:var(--muted);font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase}dd{margin:2px 0 0}.view{padding:28px 0 56px}.heading{display:flex;justify-content:space-between;align-items:end;margin-bottom:20px}.heading h2{margin:0;font-size:24px;letter-spacing:-.025em}.heading>p{max-width:520px;margin:0;color:var(--muted);font-size:13px}.experience-layout,.graph-layout{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:26px;align-items:start}.career-list{border-top:1px solid var(--line)}.career-row{display:grid;grid-template-columns:130px minmax(0,1fr) auto;gap:16px;padding:10px 7px;border-bottom:1px solid var(--line);color:var(--ink);text-decoration:none}.career-row:hover{background:var(--blue-soft)}.career-row .kind{color:var(--muted);font-size:10px;text-transform:uppercase}.career-row strong{font-weight:650}.career-row small{color:var(--muted)}.inspector{position:sticky;top:80px;padding:18px;border:1px solid var(--line);border-radius:8px;background:#fff;box-shadow:var(--shadow)}.inspector h3{margin:10px 0 5px;font-size:18px;line-height:1.3}.inspector .meta{color:var(--muted);font-size:11px}.inspector p{color:#354253}.entity-link{color:inherit;text-decoration:underline;text-decoration-color:#afc4d6}.entity-link:hover{color:var(--blue)}.connections{display:grid;margin-top:14px;border-top:1px solid var(--line)}.connections a{display:grid;grid-template-columns:1fr auto;gap:8px;padding:8px 0;border-bottom:1px solid var(--line);color:var(--ink);text-decoration:none}.connections a:hover strong{color:var(--blue)}.connections span{color:var(--muted);font-size:10px}.explore-layout{display:grid;grid-template-columns:220px minmax(0,1fr);gap:28px}.tools{position:sticky;top:80px}.tools input,.tools select{width:100%;height:36px;padding:0 10px;border:1px solid var(--line);border-radius:6px;background:#fff}.expertise-list{display:grid;max-height:520px;overflow:auto;margin-top:9px}.expertise-list button{display:flex;justify-content:space-between;border:0;border-radius:5px;background:transparent;padding:6px 8px;text-align:left;cursor:pointer}.expertise-list button[aria-current=true],.expertise-list button:hover{color:var(--blue);background:var(--blue-soft)}.result-head{padding-bottom:13px;border-bottom:1px solid var(--line)}.result-head h3{margin:0;font-size:24px}.usage{display:grid;grid-template-columns:150px minmax(0,1fr);gap:12px;padding:13px 0;border-bottom:1px solid var(--line)}.usage a{font-weight:650}.usage span{color:var(--muted);font-size:11px}.graph-toolbar{display:flex;align-items:center;gap:8px;margin-bottom:10px}.graph-toolbar select{height:32px;border:1px solid var(--line);border-radius:5px;background:#fff}.graph-wrap{min-height:500px;overflow:auto;border:1px solid var(--line);border-radius:8px;background:#fff}.graph{display:block;min-width:760px;width:100%;height:auto}.graph-edge{stroke:#cbd3da;stroke-width:1}.graph-node{cursor:pointer}.graph-node circle{fill:#fff;stroke:#8e9aaa;stroke-width:1.5}.graph-node:focus circle,.graph-node:hover circle{stroke:var(--blue);stroke-width:3}.graph-node text{fill:var(--ink);font-size:10px}.relationship-list{margin-top:14px}.relationship-list details{padding:7px 0;border-bottom:1px solid var(--line)}.relationship-list summary{cursor:pointer;font-weight:650}.table-wrap{overflow:auto;border:1px solid var(--line);border-radius:7px;background:#fff}table{width:100%;border-collapse:collapse;font-size:12px}th,td{padding:9px 11px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}th{color:var(--muted);font-size:10px;text-transform:uppercase}.notice{max-width:760px;margin-top:22px;padding-top:15px;border-top:1px solid var(--line);color:var(--muted);font-size:12px}.drawer{position:fixed;z-index:31;inset:0 0 0 auto;width:min(440px,calc(100vw - 24px));display:flex;flex-direction:column;background:#fff;border-left:1px solid var(--line);box-shadow:-18px 0 45px rgba(24,32,42,.14);transform:translateX(105%);transition:transform .18s ease}.drawer.open{transform:none}.drawer header{height:52px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:8px;padding:0 14px;border-bottom:1px solid var(--line)}.drawer header button{border:0;background:transparent;color:var(--blue);cursor:pointer}.drawer header p{overflow:hidden;margin:0;color:var(--muted);font-size:11px;white-space:nowrap;text-overflow:ellipsis}.drawer-body{padding:22px;overflow:auto}.drawer-body h2{margin:4px 0 6px;font-size:23px;line-height:1.25}.scrim{position:fixed;z-index:30;inset:0;border:0;background:rgba(24,32,42,.2)}footer{padding:20px 28px;border-top:1px solid var(--line);color:var(--muted);font-size:11px}:focus-visible{outline:3px solid #aad1ef;outline-offset:2px}@media(max-width:820px){.topbar{grid-template-columns:1fr auto;padding:0 16px}.release-id{display:none}.tabs{position:fixed;z-index:20;bottom:0;left:0;right:0;height:52px;justify-content:center;border-top:1px solid var(--line);background:#fff}.shell{padding:0 16px}.profile,.experience-layout,.graph-layout{grid-template-columns:1fr}.inspector{position:static}.explore-layout{grid-template-columns:1fr}.tools{position:static}.expertise-list{display:flex;overflow:auto}.expertise-list button{white-space:nowrap}.profile{gap:20px}footer{margin-bottom:52px}}@media(max-width:540px){.profile h1{font-size:28px}.facts{grid-template-columns:1fr}.career-row{grid-template-columns:1fr;gap:2px}.heading{display:block}.heading>p{margin-top:5px}.usage{grid-template-columns:1fr}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.drawer{transition:none}}@media print{@page{size:A4;margin:13mm}.topbar,.tabs,.inspector,.heading>p,.drawer,.scrim,footer{display:none!important}.shell{max-width:none;padding:0}.profile{padding:0 0 14px}.view{display:none!important}.view[data-view=experience]{display:block!important;padding-top:14px}.career-row{padding:5px 0;break-inside:avoid}body.resume-one-page{font-size:9px}body.resume-two-pages{font-size:11px}body.resume-three-pages{font-size:12px}}
`;

const app = `(()=>{"use strict";const root=document.querySelector("#portfolio-data"),model=JSON.parse(root.dataset.model),items=new Map(model.items.map(i=>[i.id,i])),relations=model.relations,links=id=>relations.filter(r=>r.subject===id||r.object===id),other=(r,id)=>r.subject===id?r.object:r.subject,esc=v=>String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c]),href=id=>"#entity/"+encodeURIComponent(id),entity=(id,label,klass="")=>'<a class="entity-link '+klass+'" href="'+href(id)+'" data-entity="'+esc(id)+'">'+esc(label)+'</a>';let trail=[],returnHash="#experience";const drawer=document.querySelector("#drawer"),body=document.querySelector("#drawer-body"),path=document.querySelector("#drawer-path"),back=document.querySelector("#drawer-back"),scrim=document.querySelector("#scrim");function connections(id){return links(id).map(r=>{const target=items.get(other(r,id));return target?'<a href="'+href(target.id)+'" data-entity="'+esc(target.id)+'"><strong>'+esc(target.name)+'</strong><span>'+esc(r.predicate)+'</span></a>':""}).join("")}function renderEntity(id){const item=items.get(id);if(!item)return false;body.innerHTML='<p class="overline">'+esc(item.type)+'</p><h2>'+esc(item.name)+'</h2>'+(item.summary?'<p>'+esc(item.summary)+'</p>':'<p>No reviewed narrative is present in this release.</p>')+(item.details.length?'<dl>'+item.details.map(d=>'<div><dt>'+esc(d.label)+'</dt><dd>'+esc(d.value)+'</dd></div>').join("")+'</dl>':"")+'<section><p class="overline">Connected career knowledge</p><div class="connections">'+(connections(id)||'<p>No explicit relationships connect this record.</p>')+'</div></section>'+(item.inclusion?'<p class="notice">'+esc(item.inclusion.status)+' · '+esc(item.inclusion.rationale)+'</p>':'')+'<p class="meta">Record '+esc(item.id)+' · '+esc(item.recordedAt)+'</p>';return true}function open(id,push=true){if(!drawer.classList.contains("open"))returnHash=location.hash&&!location.hash.startsWith("#entity/")?location.hash:"#experience";if(push&&trail.at(-1)!==id)trail.push(id);else if(!push)trail=[id];if(!renderEntity(id))return;drawer.classList.add("open");drawer.setAttribute("aria-hidden","false");scrim.hidden=false;back.disabled=trail.length<2;path.textContent=trail.map(x=>items.get(x)?.name||x).join(" / ");history.replaceState(null,"",href(id))}function close(){drawer.classList.remove("open");drawer.setAttribute("aria-hidden","true");scrim.hidden=true;trail=[];history.replaceState(null,"",returnHash)}document.addEventListener("click",e=>{const link=e.target.closest("[data-entity]");if(!link)return;e.preventDefault();open(link.dataset.entity)});back.addEventListener("click",()=>{if(trail.length>1){trail.pop();open(trail.at(-1),false)}});document.querySelector("#drawer-close").addEventListener("click",close);scrim.addEventListener("click",close);document.addEventListener("keydown",e=>{if(e.key==="Escape"&&drawer.classList.contains("open"))close()});const views=[...document.querySelectorAll(".view")],tabs=[...document.querySelectorAll("[data-tab]")];function setView(id){views.forEach(v=>v.hidden=v.dataset.view!==id);tabs.forEach(t=>t.setAttribute("aria-selected",String(t.dataset.tab===id)))}tabs.forEach(t=>t.addEventListener("click",()=>{setView(t.dataset.tab);history.replaceState(null,"","#"+t.dataset.tab)}));const tech=model.items.filter(i=>i.type.toLowerCase()==="technology"),expertiseList=document.querySelector("#expertise-list"),results=document.querySelector("#expertise-results");function neighbourhood(id){const seen=new Set([id]);for(let depth=0;depth<2;depth++)for(const current of [...seen])for(const relation of links(current))seen.add(other(relation,current));return [...seen].filter(x=>x!==id&&items.has(x)).map(x=>items.get(x))}function showExpertise(id){const item=items.get(id),near=neighbourhood(id);expertiseList.querySelectorAll("button").forEach(b=>b.setAttribute("aria-current",String(b.dataset.expertise===id)));results.innerHTML='<div class="result-head"><h3>'+entity(id,item.name)+'</h3><p>'+near.length+' connected records through explicit relationships.</p></div>'+near.map(n=>'<div class="usage"><span>'+esc(n.type)+'</span>'+entity(n.id,n.name)+'</div>').join("")}expertiseList.innerHTML=tech.map(t=>'<button data-expertise="'+esc(t.id)+'"><span>'+esc(t.name)+'</span><small>'+neighbourhood(t.id).length+'</small></button>').join("")||'<p>No Technology entities are connected in this release.</p>';expertiseList.addEventListener("click",e=>{const b=e.target.closest("[data-expertise]");if(b)showExpertise(b.dataset.expertise)});if(tech[0])showExpertise(tech[0].id);const search=document.querySelector("#expertise-search");search.addEventListener("input",()=>expertiseList.querySelectorAll("button").forEach(b=>b.hidden=!b.textContent.toLowerCase().includes(search.value.toLowerCase())));const graph=document.querySelector("#graph"),focus=document.querySelector("#graph-focus");focus.innerHTML=model.items.map(i=>'<option value="'+esc(i.id)+'">'+esc(i.name)+' · '+esc(i.type)+'</option>').join("");function draw(id){const selected=items.get(id),near=neighbourhood(id),nodes=[selected,...near],ids=new Set(nodes.map(n=>n.id)),edges=relations.filter(r=>ids.has(r.subject)&&ids.has(r.object));graph.querySelectorAll(".generated").forEach(n=>n.remove());const coords=new Map([[id,{x:400,y:250}]]);near.forEach((n,k)=>{const angle=2*Math.PI*k/Math.max(near.length,1);coords.set(n.id,{x:400+300*Math.cos(angle),y:250+200*Math.sin(angle)})});edges.forEach(r=>{const a=coords.get(r.subject),b=coords.get(r.object),line=document.createElementNS("http://www.w3.org/2000/svg","line");Object.entries({x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:"graph-edge generated"}).forEach(([k,v])=>line.setAttribute(k,v));graph.appendChild(line)});nodes.forEach(n=>{const p=coords.get(n.id),g=document.createElementNS("http://www.w3.org/2000/svg","g");g.setAttribute("class","graph-node generated");g.setAttribute("tabindex","0");g.setAttribute("role","link");g.dataset.entity=n.id;const c=document.createElementNS("http://www.w3.org/2000/svg","circle");c.setAttribute("cx",p.x);c.setAttribute("cy",p.y);c.setAttribute("r",n.id===id?28:11);const t=document.createElementNS("http://www.w3.org/2000/svg","text");t.setAttribute("x",p.x+(n.id===id?0:17));t.setAttribute("y",p.y+4);t.setAttribute("text-anchor",n.id===id?"middle":"start");t.textContent=n.name.length>28?n.name.slice(0,26)+"…":n.name;g.append(c,t);graph.appendChild(g)});document.querySelector("#graph-list").innerHTML=edges.map(r=>'<details><summary>'+esc(items.get(r.subject).name)+' → '+esc(items.get(r.object).name)+'</summary><p>'+esc(r.predicate)+'</p></details>').join("")||'<p>No explicit relationships are connected to this focus.</p>';document.querySelector("#graph-inspector").innerHTML='<p class="overline">Focused entity</p><h3>'+entity(selected.id,selected.name)+'</h3><p>'+esc(selected.type)+' · '+near.length+' connected records</p><div class="connections">'+connections(id)+'</div>'}focus.addEventListener("change",()=>draw(focus.value));if(model.items[0]){focus.value=tech[0]?.id||model.items[0].id;draw(focus.value)}document.querySelector("#evidence-search").addEventListener("input",e=>document.querySelectorAll("#evidence-body tr").forEach(row=>row.hidden=!row.textContent.toLowerCase().includes(e.target.value.toLowerCase())));document.querySelectorAll(".graph-node").forEach(n=>n.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open(n.dataset.entity)}}));const hash=location.hash;if(hash.startsWith("#entity/"))open(decodeURIComponent(hash.slice(8)),false);else{const view=hash.slice(1);if(views.some(v=>v.dataset.view===view))setView(view)}})();
`;

const enhancedStyles = `${styles}.drawer{width:min(660px,62vw)}.entity-pair{display:inline-flex;align-items:baseline;gap:5px}.entity-drill{display:inline-grid;width:18px;height:18px;place-items:center;border:1px solid var(--line);border-radius:4px;color:var(--blue);font-size:10px;text-decoration:none;background:#fff}.entity-drill:hover{border-color:var(--blue);background:var(--blue-soft)}.entity-graph-focus{display:inline-grid;width:25px;height:25px;margin-left:7px;place-items:center;vertical-align:3px;border:1px solid var(--line);border-radius:5px;background:#fff;color:var(--green);cursor:pointer}.entity-graph-focus:hover{border-color:var(--green);background:#edf7f2}.role{display:grid;grid-template-columns:155px minmax(0,1fr);padding:0 0 24px}.role-meta{padding:2px 22px 0 0;color:var(--muted);font-size:12px}.role-meta strong,.role-meta span{display:block}.role-meta strong{color:var(--ink);font-size:14px}.role-content{position:relative;border-left:1px solid var(--line);padding:0 0 2px 24px}.role-content:before{content:\"\";position:absolute;left:-5px;top:5px;width:9px;height:9px;border:2px solid var(--blue);border-radius:50%;background:var(--surface)}.role-content h3{margin:0;font-size:17px}.role-summary{margin:3px 0 12px;color:var(--muted);font-size:13px}.ungrouped-career{border-top:1px solid var(--line);padding-top:12px}.career-row{grid-template-columns:130px minmax(0,1fr) auto 22px}.career-row.featured,.usage.featured,tr.featured td{background:#f7f8ec}.career-row.featured:hover,.usage.featured:hover,tr.featured:hover td{background:#f2f4df}.career-row.featured{box-shadow:inset 2px 0 #d9dfaa}.drawer-body[data-featured=true]{background:linear-gradient(180deg,#f8f9ef 0,#fff 170px)}.graph-node.featured circle{fill:#f7f8ec;stroke:#a7ad73}.expertise-category{display:block;color:var(--muted);font-size:9px;font-weight:700;letter-spacing:.05em;text-transform:uppercase}.graph-instruction{margin:-4px 0 12px;padding:8px 10px;border-left:2px solid var(--blue);background:var(--blue-soft);color:#405063;font-size:12px}@media(max-width:760px){.drawer{width:calc(100vw - 16px)}.role{grid-template-columns:110px minmax(0,1fr)}}@media(max-width:540px){.role{display:block}.role-meta{padding:0 0 7px}.role-content{padding-left:16px}}\n`;

const refinedStyles = enhancedStyles
  .replace(".shell{max-width:1220px;margin:auto;padding:0 28px}", ".shell{width:min(100%,1480px);margin:auto;padding:0 32px}")
  .replace("width:min(660px,62vw)", "width:min(720px,66vw)")
  .replaceAll("#f7f8ec", "#fdfdfb")
  .replace("#f2f4df", "#fbfcf8")
  .replace("#d9dfaa", "#f2f1e8")
  .replace("#f8f9ef", "#fefefc")
  .replace("#a7ad73", "#dde0cf");

const neutralFeaturedStyles = `.career-row.featured,.career-row.featured:hover,.usage.featured,.usage.featured:hover,tr.featured td,tr.featured:hover td{background:transparent}.career-row.featured{box-shadow:none}.drawer-body[data-featured=true]{background:var(--surface)}.graph-node.featured circle{fill:#fff;stroke:#8e9aaa}`;

const mobileSelectedDetailStyles = `.mobile-detail-close,.mobile-detail-scrim{display:none}@media(max-width:820px){.graph-layout #graph-inspector{position:fixed;z-index:28;inset:auto 0 0;width:100%;height:min(78svh,680px);min-height:280px;overflow:auto;overscroll-behavior:contain;border:0;border-top:1px solid var(--line);border-radius:16px 16px 0 0;box-shadow:0 -18px 45px rgba(24,32,42,.14);transform:translateY(105%);visibility:hidden;transition:transform .18s ease,visibility .18s ease}.graph-layout #graph-inspector.is-mobile-open{transform:none;visibility:visible}.mobile-detail-close{display:block;float:right;border:1px solid var(--line);border-radius:5px;padding:7px 10px;background:var(--surface);cursor:pointer}.mobile-detail-scrim:not([hidden]){display:block;position:fixed;z-index:27;inset:0;border:0;background:rgba(24,32,42,.2)}body.mobile-detail-open{overflow:hidden}}@media(max-width:820px) and (prefers-reduced-motion:reduce){.graph-layout #graph-inspector{transition:none}}@media print{.mobile-detail-scrim,.mobile-detail-close{display:none!important}}`;

const enhancedApp = app
  .replace("No reviewed narrative is present in this release.", "No reviewed entity-specific narrative is present; explore related records for context.")
  .replace("return true}function open(id", "const refs=(model.links||[]).filter(link=>link.targetRecordId===id);if(refs.length)body.insertAdjacentHTML('beforeend','<section class=\"reviewed-links\"><p class=\"overline\">Reference links</p>'+refs.map(link=>'<p><a href=\"'+esc(link.url)+'\" target=\"_blank\" rel=\"noopener noreferrer\">'+esc(link.label)+'</a> · '+esc(link.sourceStatus)+'</p>').join('')+'</section>');return true}function open(id")
  .replace("entity=(id,label,klass=\"\")=>'<a class=\"entity-link '+klass+'\" href=\"'+href(id)+'\" data-entity=\"'+esc(id)+'\">'+esc(label)+'</a>'", "entity=(id,label,klass=\"\")=>'<span class=\"entity-pair '+klass+'\"><span>'+esc(label)+'</span><a class=\"entity-drill\" href=\"'+href(id)+'\" data-entity=\"'+esc(id)+'\" aria-label=\"Explore '+esc(label)+'\">↗</a></span>'")
  .replace("const tech=model.items.filter(i=>i.type.toLowerCase()===\"technology\"),expertiseList", "const tech=model.items.filter(i=>i.type.toLowerCase()===\"technology\"),categoryFor=t=>{const relation=relations.find(r=>r.predicate===\"technology.belongs_to_category\"&&r.subject===t.id);return relation?items.get(relation.object):null},expertiseList")
  .replace("esc(t.name)+'</span><small>'+neighbourhood(t.id).length", "'<small class=\"expertise-category\">'+esc(categoryFor(t)?.name||\"Uncategorised\")+'</small>'+esc(t.name)+'</span><small>'+neighbourhood(t.id).length")
  .replace("g.dataset.entity=n.id", "g.dataset.node=n.id")
  .replace("open(n.dataset.entity)", "open(n.dataset.node)")
  .replace("<h2>'+esc(item.name)+'</h2>", "<h2>'+esc(item.name)+' <button class=\"entity-graph-focus\" type=\"button\" data-focus-graph=\"'+esc(item.id)+'\" aria-label=\"Show '+esc(item.name)+' focused in the career graph\">◎</button></h2>")
  .replace("body.innerHTML='<p class=\"overline\">'", "body.dataset.featured=String(item.inclusion?.status==='featured');body.innerHTML='<p class=\"overline\">'")
  .replace("'<div class=\"usage\"><span>'+esc(n.type)+'", "'<div class=\"usage '+(n.inclusion?.status==='featured'?'featured':'')+'\"><span>'+esc(n.type)+'")
  .replace('g.setAttribute("class","graph-node generated")', 'g.setAttribute("class","graph-node generated"+(n.inclusion?.status==="featured"?" featured":""))')
  .replace('document.querySelectorAll(".graph-node").forEach(n=>n.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open(n.dataset.node)}}))', 'graph.addEventListener("keydown",e=>{const n=e.target.closest(".graph-node");if(n&&(e.key==="Enter"||e.key===" ")){e.preventDefault();open(n.dataset.node)}})')
  .replace("const hash=location.hash;", "document.addEventListener('click',e=>{const control=e.target.closest('[data-focus-graph]');if(!control)return;const id=control.dataset.focusGraph;close();setView('graph-view');focus.value=id;draw(id);history.replaceState(null,'','#graph-view')});let graphPress=null;const cancelPress=()=>{if(graphPress){clearTimeout(graphPress.timer);graphPress=null}};graph.addEventListener('click',e=>{const n=e.target.closest('.graph-node');if(n){focus.value=n.dataset.node;draw(n.dataset.node)}});graph.addEventListener('dblclick',e=>{const n=e.target.closest('.graph-node');if(n){e.preventDefault();open(n.dataset.node)}});graph.addEventListener('contextmenu',e=>{const n=e.target.closest('.graph-node');if(n){e.preventDefault();open(n.dataset.node)}});graph.addEventListener('pointerdown',e=>{const n=e.target.closest('.graph-node');if(n)graphPress={x:e.clientX,y:e.clientY,timer:setTimeout(()=>{open(n.dataset.node);graphPress=null},500)}});graph.addEventListener('pointermove',e=>{if(graphPress&&(Math.abs(e.clientX-graphPress.x)>7||Math.abs(e.clientY-graphPress.y)>7))cancelPress()});graph.addEventListener('pointerup',cancelPress);graph.addEventListener('pointercancel',cancelPress);const hash=location.hash;");

const mobileSelectedDetailApp = `${enhancedApp}\n(()=>{const panel=document.querySelector("#graph-inspector"),focus=document.querySelector("#graph-focus"),graph=document.querySelector("#graph"),tabs=document.querySelector(".tabs");if(!panel||!focus||!graph)return;const model=JSON.parse(document.querySelector("#portfolio-data").dataset.model),items=new Map(model.items.map(item=>[item.id,item])),small=window.matchMedia("(max-width: 820px)");let returnFocus=null;const closeButton=document.createElement("button");closeButton.type="button";closeButton.className="mobile-detail-close";closeButton.textContent="Close details";panel.prepend(closeButton);const scrim=document.createElement("button");scrim.type="button";scrim.className="mobile-detail-scrim";scrim.setAttribute("aria-label","Close selected record details");scrim.hidden=true;document.body.append(scrim);function describe(){const item=items.get(focus.value),heading=panel.querySelector("h3");if(!item||!heading)return;let summary=panel.querySelector(".focused-summary");if(!summary){summary=document.createElement("p");summary.className="focused-summary";heading.after(summary)}summary.textContent=item.summary||"No entity-specific narrative is present; explore the linked records for context."}function close(returnToTrigger=true){panel.classList.remove("is-mobile-open");scrim.hidden=true;document.body.classList.remove("mobile-detail-open");if(returnToTrigger&&returnFocus?.isConnected)returnFocus.focus();returnFocus=null}function open(trigger){describe();if(!small.matches)return;returnFocus=trigger instanceof HTMLElement?trigger:document.activeElement;panel.classList.add("is-mobile-open");scrim.hidden=false;document.body.classList.add("mobile-detail-open");const heading=panel.querySelector("h3");if(heading){heading.tabIndex=-1;heading.focus()}}describe();focus.addEventListener("change",e=>open(e.target));graph.addEventListener("click",e=>{const node=e.target.closest(".graph-node");if(node){focus.value=node.dataset.node;open(node)}});closeButton.addEventListener("click",()=>close());scrim.addEventListener("click",()=>close());tabs?.addEventListener("click",()=>close(false));document.addEventListener("keydown",e=>{if(e.key==="Escape"&&panel.classList.contains("is-mobile-open"))close()});small.addEventListener("change",()=>close(false));document.addEventListener("click",e=>{if(e.target.closest("[data-entity]")&&panel.classList.contains("is-mobile-open"))close(false)})})();`;

const legacyMobileStart = mobileSelectedDetailApp.lastIndexOf("\n(()=>{const panel=");
const completeGraphStart = mobileSelectedDetailApp.indexOf('const graph=document.querySelector("#graph"),focus=document.querySelector("#graph-focus");');
const completeGraphEnd = mobileSelectedDetailApp.indexOf("const hash=location.hash;", completeGraphStart);
if (legacyMobileStart < 0 || completeGraphStart < 0 || completeGraphEnd < 0 || completeGraphEnd >= legacyMobileStart) {
  throw new Error("Canonical graph template assembly could not locate the previous graph module.");
}
const existingAppWithoutLegacyMobile = mobileSelectedDetailApp.slice(0, legacyMobileStart);
const completeGraphApp = existingAppWithoutLegacyMobile.slice(0, completeGraphStart)
  + cytoscapeCareerGraphApp
  + existingAppWithoutLegacyMobile.slice(completeGraphEnd)
  + "\n" + mobileCareerGraphDetailApp;
const progressiveExperienceStyles = `.career-entry{display:flex;min-width:0;flex-direction:column;gap:3px}.career-entry strong{line-height:1.35}.career-summary{display:-webkit-box;max-width:58ch;overflow:hidden;color:var(--muted);font-size:12px;line-height:1.45;-webkit-line-clamp:2;-webkit-box-orient:vertical}.career-more{padding:8px 0 0;border-bottom:1px solid var(--line)}.career-more>summary{display:flex;align-items:center;gap:8px;padding:8px 10px;color:var(--blue);font-size:12px;font-weight:650;cursor:pointer;list-style:none}.career-more>summary::-webkit-details-marker{display:none}.career-more>summary:before{content:"+";display:grid;width:18px;height:18px;place-items:center;border:1px solid #b7cbdc;border-radius:3px;background:#fff}.career-more[open]>summary:before{content:"−"}.career-more>summary:hover{background:var(--blue-soft)}.career-more .career-row:last-child{border-bottom:0}@media print{.career-more>summary{display:none}.career-more>div{display:block!important}.career-summary{-webkit-line-clamp:unset;display:block}}`;

for (const requiredTemplateToken of [
  "entity-drill",
  "technology.belongs_to_category",
  "expertise-category",
  "data-focus-graph",
  "dataset.node",
  "contextmenu",
  "pointerdown",
  'graph.addEventListener("keydown"',
]) {
  if (!enhancedApp.includes(requiredTemplateToken)) {
    throw new Error(`Canonical portfolio template assembly omitted ${requiredTemplateToken}.`);
  }
}

export class StaticHtmlCareerPortfolioRenderer
  implements CareerPortfolioRenderer
{
  public constructor(private readonly digester: ReleaseDigester) {}

  public render(
    release: ValidatedKnowledgeRelease,
    inclusionDecisions: readonly PortfolioInclusionDecision[],
    options: CareerPortfolioOptions,
  ): CareerPortfolioProjection {
    const decisions = new Map(
      inclusionDecisions.map((decision) => [decision.recordId, decision]),
    );
    const excluded = new Set(
      inclusionDecisions
        .filter((decision) => decision.status === "excluded")
        .map((decision) => decision.recordId),
    );
    const displayRecords = release.records.filter(
      (record) =>
        (record.recordType === "Entity" ||
          record.recordType === "Evidence" ||
          (record.recordType === "Claim" &&
            object(record.data).claimType === "reported-outcome")) &&
        !excluded.has(record.id),
    );
    const items = displayRecords.map((record) =>
      itemFrom(record, decisions.get(record.id) ?? null),
    );
    const itemIds = new Set(items.map((item) => item.id));
    const relations = release.records
      .filter((record) => record.recordType === "Claim")
      .flatMap((record) => {
        const relation = relationFrom(record);
        return relation &&
          itemIds.has(relation.subject) &&
          itemIds.has(relation.object)
          ? [relation]
          : [];
      });
    return this.renderDisplayModel({
      schema: "why-hire-me.portfolio-display/v1",
      subjectDisplayName: release.manifest.subject.displayName,
      purpose: release.manifest.purpose,
      audience: release.manifest.audience,
      resumeLength: options.resumeLength,
      items,
      relations,
      links: [],
      assets: [],
      limitations: release.manifest.limitations,
      provenance: { mode: "governed-render", releaseId: release.manifest.releaseId,
        releaseDigest: release.manifest.releaseDigest, createdAt: release.manifest.createdAt,
        authorisationExpiresAt: release.manifest.view.expiresAt },
    }, inclusionDecisions, release.records, release.manifest);
  }

  /** Both validated releases and reviewed prototype packets use this exact shell and graph runtime. */
  public renderDisplayModel(
    display: CareerPortfolioDisplayModel,
    inclusionDecisions: readonly PortfolioInclusionDecision[],
    sourceRecords: readonly ReleaseInputRecord[] = [],
    sourceManifest?: ValidatedKnowledgeRelease["manifest"],
  ): CareerPortfolioProjection {
    const items = [...display.items];
    const relations = [...display.relations];
    const options = { resumeLength: display.resumeLength };
    const achievements = items.filter((item) => item.inclusion !== null);
    const evidence = items.filter((item) => item.type === "Evidence");
    const model = esc(JSON.stringify({ items, relations, links: display.links }));
    const drill = (item: PortfolioItem) => `<a class="entity-drill" href="#entity/${encodeURIComponent(item.id)}" data-entity="${esc(item.id)}" aria-label="Explore ${esc(item.name)}">↗</a>`;
    const connected = (id: string, type: string) => relations
      .flatMap((relation) => relation.subject === id ? [relation.object] : relation.object === id ? [relation.subject] : [])
      .map((target) => items.find((item) => item.id === target))
      .find((item) => item?.type.toLowerCase() === type.toLowerCase());
    const achievementPriority = (item: PortfolioItem) =>
      item.inclusion!.status === "featured" ? 0 : item.inclusion!.status === "supporting" ? 1 :
      item.inclusion!.status === "summarised" ? 2 : 3;
    const orderedAchievements = (records: readonly PortfolioItem[]) => [...records].sort((a, b) =>
      achievementPriority(a) - achievementPriority(b) ||
      ({ Work: 0, Contribution: 1, "Reported outcome": 2 }[a.type] ?? 3) -
      ({ Work: 0, Contribution: 1, "Reported outcome": 2 }[b.type] ?? 3) ||
      a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
    const renderAchievement = (item: PortfolioItem, preview = false) =>
      `<div class="career-row${item.inclusion!.status === "featured" ? " featured" : ""}"><span class="kind">${esc(item.type)}</span><span class="career-entry"><strong>${esc(item.name)}</strong>${preview && item.summary ? `<span class="career-summary">${esc(item.summary)}</span>` : ""}</span><small>${esc(item.inclusion!.status)}</small>${drill(item)}</div>`;
    const renderAchievementGroup = (records: readonly PortfolioItem[]) => {
      const ordered = orderedAchievements(records);
      const featured = ordered.filter((item) => item.inclusion!.status === "featured");
      const primary = (featured.length ? featured : ordered).slice(0, featured.length ? 8 : 2);
      const primaryIds = new Set(primary.map((item) => item.id));
      const remaining = ordered.filter((item) => !primaryIds.has(item.id));
      return `<div class="achievement-list">${primary.map((item) => renderAchievement(item, true)).join("")}${remaining.length ? `<details class="career-more"><summary>Show ${remaining.length} more ${remaining.length === 1 ? "record" : "records"} from this work</summary><div>${remaining.map((item) => renderAchievement(item)).join("")}</div></details>` : ""}</div>`;
    };
    const groupedAchievementIds = new Set<string>();
    const engagementRows = items
      .filter((item) => item.type.toLowerCase() === "engagement")
      .map((engagement) => {
        const directIds = new Set(relations
          .flatMap((relation) => relation.subject === engagement.id ? [relation.object] : relation.object === engagement.id ? [relation.subject] : []));
        const workIds = new Set(achievements
          .filter((achievement) => achievement.type.toLowerCase() === "work" && directIds.has(achievement.id))
          .map((achievement) => achievement.id));
        const grouped = achievements.filter((achievement) => directIds.has(achievement.id) || relations.some((relation) =>
          (relation.subject === achievement.id && workIds.has(relation.object)) ||
          (relation.object === achievement.id && workIds.has(relation.subject))));
        grouped.forEach((achievement) => groupedAchievementIds.add(achievement.id));
        if (!grouped.length) return "";
        const organisation = connected(engagement.id, "Organisation");
        const role = connected(engagement.id, "Role");
        const dates = engagement.details.find((detail) => /date|period|timeline/i.test(detail.label))?.value ?? "";
        return `<article class="role"><div class="role-meta"><strong>${esc(organisation?.name ?? engagement.name)} ${drill(organisation ?? engagement)}</strong>${dates ? `<span>${esc(dates)}</span>` : ""}</div><div class="role-content"><h3>${esc(role?.name ?? engagement.name)} ${drill(role ?? engagement)}</h3>${engagement.summary ? `<p class="role-summary">${esc(engagement.summary)}</p>` : ""}${renderAchievementGroup(grouped)}</div></article>`;
      })
      .join("");
    const ungrouped = achievements.filter((achievement) => !groupedAchievementIds.has(achievement.id));
    const careerRows = engagementRows + (ungrouped.length
      ? `<section class="ungrouped-career" aria-label="Other career evidence">${engagementRows ? '<p class="overline">Other career evidence</p>' : ""}${renderAchievementGroup(ungrouped)}</section>`
      : "") || "<p>No authorised career achievements are present.</p>";
    const evidenceRows = items
      .map(
        (item) =>
          `<tr${item.inclusion?.status === "featured" ? ' class="featured"' : ""}><td><code>${esc(item.id)}</code></td><td><span class="entity-pair"><span>${esc(item.name)}</span>${drill(item)}</span></td><td>${esc(item.type)}</td><td>${item.inclusion ? esc(item.inclusion.status) : "context"}</td></tr>`,
      )
      .join("");
    const relationIndex =
      relations
        .map(
          (relation) =>
            `<details><summary>${esc(items.find((item) => item.id === relation.subject)?.name ?? relation.subject)} ${drill(items.find((item) => item.id === relation.subject)!)} → ${esc(items.find((item) => item.id === relation.object)?.name ?? relation.object)} ${drill(items.find((item) => item.id === relation.object)!)}</summary><p>${esc(relation.predicate)}</p></details>`,
        )
        .join("") ||
      "<p>No explicit claim relationships are present; the renderer has not invented any.</p>";
    const linkIndex = display.links.length
      ? `<section class="reviewed-links" aria-label="Reviewed reference links"><h3>Reference links</h3><ul>${display.links.map(link =>
        `<li><a href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">${esc(link.label)}</a>${link.targetRecordId ? ` · ${esc(items.find(item => item.id === link.targetRecordId)?.name ?? link.targetRecordId)}` : ""} · ${esc(link.sourceStatus)}</li>`).join("")}</ul></section>`
      : "";
    const resumeAsset = display.assets.find(asset => asset.kind === "resume-pdf");
    const resumeLink = resumeAsset ? `<a class="resume-download" href="${esc(resumeAsset.outputPath)}" download>Download reviewed résumé PDF</a>` : "";
    const title = esc(display.subjectDisplayName);
    const sourceLabel = display.provenance.mode === "governed-render"
      ? display.provenance.releaseId : `Prototype packet ${display.provenance.packetId}`;
    const release = { manifest: { releaseId: sourceLabel, purpose: display.purpose,
      audience: display.audience, limitations: display.limitations } };
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'none'; base-uri 'none'; form-action 'none'"><title>${title} · Career profile</title><link rel="stylesheet" href="styles.css"><script src="app.js" defer></script></head><body class="resume-${esc(options.resumeLength)}"><a class="skip" href="#content">Skip to career record</a><header class="topbar"><a class="wordmark" href="#experience">${title}</a><nav class="tabs" role="tablist" aria-label="Career profile views"><button data-tab="experience" role="tab" aria-selected="true">Experience</button><button data-tab="expertise" role="tab" aria-selected="false">Expertise</button><button data-tab="graph-view" role="tab" aria-selected="false">Graph</button><button data-tab="evidence" role="tab" aria-selected="false">Evidence</button></nav><span class="release-id">${esc(release.manifest.releaseId)}</span></header><main id="content" class="shell"><section class="profile"><div><p class="overline">Evidence-linked career profile</p><h1>${title}</h1><p class="lead">A compact, navigable view prepared for ${esc(release.manifest.purpose)}. Use the explore icon beside an entity to open its connected career context.</p></div><dl class="facts"><div><dt>Audience</dt><dd>${esc(release.manifest.audience)}</dd></div><div><dt>Career records</dt><dd>${achievements.length}</dd></div><div><dt>Relationships</dt><dd>${relations.length}</dd></div><div><dt>Résumé</dt><dd>${esc(options.resumeLength)}</dd></div></dl></section><section class="view" data-view="experience"><div class="heading"><div><p class="overline">Career</p><h2>Experience</h2></div><p>Use the explore icon beside a record to open its context and relationships.</p></div><div class="experience-layout"><div class="career-list">${careerRows}</div><aside class="inspector"><p class="overline">Career record</p><h3>Explore the evidence</h3><p>The explore icon opens a stable deep link in the side navigator without making every row disruptive.</p></aside></div></section><section class="view" data-view="expertise" hidden><div class="heading"><div><p class="overline">Explore by capability</p><h2>Expertise</h2></div><p>Technology views are derived only from explicit release relationships.</p></div><div class="explore-layout"><aside class="tools"><label for="expertise-search">Find expertise</label><input id="expertise-search" type="search"><div id="expertise-list" class="expertise-list"></div></aside><div id="expertise-results"></div></div></section><section class="view" data-view="graph-view" hidden><div class="heading"><div><p class="overline">Relationships</p><h2>Career graph</h2></div><p>Choose a focus, then inspect or drill into connected nodes.</p></div><p class="graph-instruction"><strong>Click</strong> to focus · <strong>double-click, right-click, or long-press</strong> to open the side navigator · <strong>Enter</strong> opens a focused node from the keyboard</p><div class="graph-toolbar"><label for="graph-focus">Focus</label><select id="graph-focus"></select></div><div class="graph-layout"><div class="graph-wrap"><svg id="graph" class="graph" viewBox="0 0 800 500" role="img" aria-labelledby="graph-title graph-desc"><title id="graph-title">Interactive career graph</title><desc id="graph-desc">A focused view of explicit career relationships.</desc></svg></div><aside id="graph-inspector" class="inspector"></aside></div><div id="graph-list" class="relationship-list">${relationIndex}</div></section><section class="view" data-view="evidence" hidden><div class="heading"><div><p class="overline">Traceability</p><h2>Evidence</h2></div><p>All displayed records remain available outside the graph.</p></div><div class="tools"><label for="evidence-search">Search records</label><input id="evidence-search" type="search"></div><div class="table-wrap"><table><thead><tr><th>Record</th><th>Name</th><th>Type</th><th>Use</th></tr></thead><tbody id="evidence-body">${evidenceRows}</tbody></table></div><div class="notice"><p>${evidence.length} evidence records · ${release.manifest.limitations.map(esc).join(" · ")}</p><p>Résumé projection: ${esc(options.resumeLength)}. Public copies may remain after the release authority expires.</p></div></section></main><aside id="drawer" class="drawer" aria-label="Entity explorer" aria-hidden="true"><header><button id="drawer-back" disabled>← Back</button><p id="drawer-path"></p><button id="drawer-close">Close</button></header><div id="drawer-body" class="drawer-body"></div></aside><button id="scrim" class="scrim" hidden aria-label="Close entity explorer"></button><div id="portfolio-data" hidden data-model="${model}"></div><footer>Renderer 0.3.1 · Offline by default · No analytics or network resources</footer></body></html>\n`;
    const graphHeadStart = html.indexOf('<p class="graph-instruction">');
    const graphHeadEnd = html.indexOf('<div id="graph-list"', graphHeadStart);
    if (graphHeadStart < 0 || graphHeadEnd < 0) {
      throw new Error("Canonical graph markup could not be upgraded to the complete graph.");
    }
    const completeGraphMarkup = '<p class="graph-instruction"><strong>All reviewed relationships</strong> are present · drag to pan · scroll or pinch to zoom · hover for a name · click a node to show and frame every directly connected name · expand or explore for detail.</p><div id="graph-shell" class="graph-shell"><div class="graph-toolbar"><div class="graph-focus-picker"><label for="graph-focus">Focus records</label><input id="graph-focus" type="search" autocomplete="off" role="combobox" aria-controls="graph-focus-options" aria-expanded="false" placeholder="Type a name, technology, category, or work item"><div id="graph-focus-options" class="graph-focus-options" role="listbox" aria-multiselectable="true" hidden></div><div id="graph-focus-chips" class="graph-focus-chips" aria-live="polite"></div></div><div class="graph-actions"><button id="graph-focus-clear" type="button">Clear focus</button><button id="graph-expand" type="button">Expand neighbours</button><button id="graph-fit" type="button">Reset overview</button></div></div><div class="graph-layout"><div class="graph-wrap"><div id="graph" class="graph" role="img" aria-label="Complete interactive career graph. Use the keyboard browser after the graph for non-pointer access."></div></div><aside id="graph-inspector" class="inspector" aria-label="Selected node context"></aside></div><details class="graph-keyboard"><summary>Browse every graph node by keyboard</summary><div class="tools"><label for="graph-keyboard-node">Record</label><select id="graph-keyboard-node"></select><button id="graph-keyboard-read" type="button">Read connections</button><button id="graph-keyboard-explore" type="button">Open details</button></div></details></div>';
    const markedHtml = (html.slice(0, graphHeadStart) + completeGraphMarkup + html.slice(graphHeadEnd))
      .replace("<meta charset=\"utf-8\">", "<meta charset=\"utf-8\"><meta name=\"generator\" content=\"why-hire-me.build/v1\">")
      .replace("Choose a focus, then inspect or drill into connected nodes.", "All authorised records are shown. Add focus records to trace several contexts at once.")
      .replace("explicit release relationships", "explicit reviewed relationships")
      .replace("No reviewed narrative is present in this release.", "No reviewed entity-specific narrative is present.")
      .replace("Public copies may remain after the release authority expires.",
        display.provenance.mode === "governed-render"
          ? "Public copies may remain after the release authority expires."
          : "Local prototype · session-only · not governed · partially validated. This packet is not a validated release.")
      .replace('<div class="notice"><p>', `${linkIndex}<div class="notice"><p>`)
      .replace('<h1>'+title+'</h1>', `<h1>${title}</h1>${resumeLink}`)
      .replace("Renderer 0.3.1 · Offline by default · No analytics or network resources",
        'Made with <a href="https://github.com/rajanrx/why-hire-me">Why Hire Me</a> · Renderer 0.4.1 · Offline by default · No analytics or network resources');
    const portfolioJson = `${JSON.stringify({ schema: "why-hire-me.portfolio-data/v0.3",
      buildMarker: "why-hire-me.build/v1", provenance: display.provenance,
      ...(sourceManifest ? { release: sourceManifest, records: sourceRecords } : { displayModel: display }),
      options, inclusionDecisions }, null, 2)}\n`;
    const files = Object.freeze({
      "index.html": markedHtml,
      "styles.css": refinedStyles + neutralFeaturedStyles + progressiveExperienceStyles + cytoscapeCareerGraphStyles +
        cytoscapeCareerGraphLegendStyles + mobileSelectedDetailStyles,
      "app.js": cytoscapeBrowserSource + "\n" + completeGraphApp,
      "portfolio.json": portfolioJson,
    });
    const paths = [
      "index.html",
      "styles.css",
      "app.js",
      "portfolio.json",
    ] as const;
    const fileManifest = paths.map((path) =>
      Object.freeze({
        path,
        bytes: Buffer.byteLength(files[path]),
        sha256: this.digester.sha256(files[path]),
      }),
    );
    const identity = {
      schema: "why-hire-me.portfolio/v0.3" as const,
      rendererVersion: "0.4.1" as const,
      buildMarker: "why-hire-me.build/v1" as const,
      resumeLength: options.resumeLength,
      releaseId: display.provenance.mode === "governed-render" ? display.provenance.releaseId : null,
      releaseDigest: display.provenance.mode === "governed-render" ? display.provenance.releaseDigest : null,
      authorisationExpiresAt: display.provenance.mode === "governed-render" ? display.provenance.authorisationExpiresAt : null,
      generatedAt: display.provenance.mode === "governed-render" ? display.provenance.createdAt : display.provenance.generatedAt,
      entryPoint: "index.html" as const,
      files: fileManifest,
      limitations: display.limitations,
      inclusionDecisions: Object.freeze([...inclusionDecisions]),
      ...(display.provenance.mode === "local-prototype" ? { prototypeInput: {
        packetId: display.provenance.packetId, reviewedBy: display.provenance.reviewedBy,
        reviewReference: display.provenance.reviewReference,
        validation: display.provenance.validation, status: display.provenance.status,
      } } : {}),
    };
    const projectionDigest = this.digester.sha256(JSON.stringify(identity));
    return Object.freeze({
      files,
      manifest: Object.freeze({
        ...identity,
        portfolioId: `portfolio-${projectionDigest.slice(0, 24)}`,
        projectionDigest,
      }),
    });
  }
}

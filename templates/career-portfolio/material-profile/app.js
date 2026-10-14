/* Why Hire Me — material-profile runtime. Plain ES2020, no network access; Cytoscape is bundled before this file. */
(() => {
  "use strict";

  const root = document.documentElement;
  root.classList.add("js");
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const esc = value => String(value).replace(/[&<>"']/g, character =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const hrefFor = (prefix, id) => `#${prefix}/${encodeURIComponent(id)}`;

  // ---- Theme: system by default, remembered override when storage is available ----
  const THEME_KEY = "why-hire-me-theme";
  const storage = {
    get() { try { return localStorage.getItem(THEME_KEY); } catch { return null; } },
    set(value) { try { localStorage.setItem(THEME_KEY, value); } catch { /* private mode: keep in memory */ } },
  };
  const savedTheme = storage.get();
  if (savedTheme === "light" || savedTheme === "dark") root.dataset.theme = savedTheme;
  const systemDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : systemDark();
  $("#theme-toggle")?.addEventListener("click", () => {
    root.dataset.theme = isDark() ? "light" : "dark";
    storage.set(root.dataset.theme);
    if (graph.instance) graph.restyle();
  });

  // ---- Model: explicit relationships only, traversed by record type ----
  const data = JSON.parse($("#portfolio-data").textContent);
  const items = new Map(data.items.map(item => [item.id, item]));
  const order = new Map(data.items.map((item, index) => [item.id, index]));
  const type = id => (items.get(id)?.type || "").toLowerCase();
  const adjacency = new Map();
  for (const relation of data.relations) {
    if (!items.has(relation.subject) || !items.has(relation.object)) continue;
    for (const [from, to] of [[relation.subject, relation.object], [relation.object, relation.subject]]) {
      if (!adjacency.has(from)) adjacency.set(from, new Set());
      adjacency.get(from).add(to);
    }
  }
  const BRIDGES = new Set(["technologyuse"]);
  const KIND = {
    engagement: "where", organisation: "where", role: "where",
    work: "built", contribution: "built",
    "reported outcome": "achieved",
    technology: "tool", technologycategory: "tool",
  };
  const kindOf = id => KIND[type(id)] || "other";
  const LABEL = {
    engagement: "Role", organisation: "Company", role: "Job title", work: "Work", contribution: "Contribution",
    "reported outcome": "Result", technology: "Technology", technologycategory: "Skill area",
    technologyuse: "Technology use", credential: "Credential", publication: "Publication",
    "reference link": "Link", person: "Person", evidence: "Evidence",
  };
  const labelOf = id => LABEL[type(id)] || items.get(id)?.type || "Record";
  const featured = id => items.get(id)?.inclusion?.status === "featured";
  const byPriority = (a, b) => Number(!featured(a)) - Number(!featured(b)) || order.get(a) - order.get(b);

  /** Direct neighbours, looking through bridge records and never through the person hub. */
  function neighbours(id) {
    const result = new Set();
    for (const next of adjacency.get(id) || []) {
      if (type(next) === "person" && type(id) !== "person") continue;
      if (BRIDGES.has(type(next))) for (const far of adjacency.get(next) || []) { if (far !== id) result.add(far); }
      else result.add(next);
    }
    result.delete(id);
    return [...result];
  }

  /** "Where was it used, what was built, what did it achieve" — expands only through work records. */
  function exploreGroups(focus) {
    const focusKind = kindOf(focus), focusType = type(focus);
    const seen = new Set([focus]);
    let frontier = [focus];
    for (let depth = 1; depth <= 3 && frontier.length; depth += 1) {
      const next = [];
      for (const id of frontier) {
        for (const near of neighbours(id)) {
          if (seen.has(near)) continue;
          // Tools used alongside connected work are a different question; keep only direct ones.
          if (depth > 1 && kindOf(near) === "tool") continue;
          seen.add(near);
          const expandable = kindOf(near) === "built" ||
            (depth === 1 && focusType === "technologycategory" && type(near) === "technology") ||
            (depth === 1 && focusKind === "where" && type(near) === "engagement");
          if (expandable) next.push(near);
        }
      }
      frontier = next;
    }
    seen.delete(focus);
    const groups = { where: [], built: [], achieved: [], tool: [] };
    for (const id of seen) groups[kindOf(id)]?.push(id);
    for (const list of Object.values(groups)) list.sort(byPriority);
    return groups;
  }

  // ---- Destinations and routing ----
  const destinations = $$("[data-destination]");
  const navItems = $$("[data-nav]");
  let returnHash = "#overview";
  let lastDestination = null;

  function parseRoute() {
    const parts = location.hash.slice(1).split("/").map(part => { try { return decodeURIComponent(part); } catch { return part; } });
    const [name = "", first, second] = parts;
    if (name === "entity" && items.has(first)) return { entity: first };
    if (name === "explore" && first === "graph" && items.has(second)) return { destination: "explore", focus: second, graph: true };
    if (name === "explore") return { destination: "explore", focus: items.has(first) ? first : null };
    if (name === "career") return { destination: "career", role: items.has(first) ? first : null };
    if (destinations.some(section => section.dataset.destination === name)) return { destination: name };
    return { destination: "overview" };
  }

  function showDestination(name, moveFocus) {
    for (const section of destinations) section.hidden = section.dataset.destination !== name;
    const navName = name === "records" ? "explore" : name;
    for (const item of navItems) {
      if (item.dataset.nav === navName) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    }
    if (moveFocus && lastDestination !== name) {
      window.scrollTo(0, 0);
      $(`[data-destination="${name}"] h1, [data-destination="${name}"] h2`)?.setAttribute("tabindex", "-1");
      $(`[data-destination="${name}"] h1, [data-destination="${name}"] h2`)?.focus({ preventScroll: true });
    }
    lastDestination = name;
  }

  function showRole(roleId) {
    const container = $(".list-detail");
    if (!container) return;
    const wide = window.matchMedia("(min-width: 840px)").matches;
    const active = roleId || (wide ? $(".role-detail")?.dataset.role : null);
    for (const detail of $$(".role-detail")) {
      if (detail.dataset.role === active) detail.dataset.active = ""; else delete detail.dataset.active;
    }
    for (const link of $$("[data-role-link]")) link.setAttribute("aria-current", String(link.dataset.roleLink === active));
    if (roleId) container.dataset.hasActive = ""; else delete container.dataset.hasActive;
  }

  function route(initial = false) {
    const current = parseRoute();
    if (current.entity) {
      if (lastDestination === null) showDestination("overview", false);
      openSheet(current.entity);
      return;
    }
    closeSheet(false);
    returnHash = location.hash || "#overview";
    showDestination(current.destination, !initial);
    if (current.destination === "career") showRole(current.role);
    if (current.destination === "explore") renderExplore(current.focus, current.graph);
  }

  // ---- Explore ----
  const search = $("#explore-search");
  const suggestions = $("#explore-suggestions");
  const result = $("#explore-result");
  const searchable = data.items.filter(item => ["tool", "built", "achieved", "where"].includes(kindOf(item.id)) && type(item.id) !== "role");
  const defaultFocusIds = data.items.filter(item => type(item.id) === "technologycategory").map(item => item.id);

  function renderSuggestions(query) {
    const text = query.trim().toLowerCase();
    const matches = text
      ? searchable.filter(item => item.name.toLowerCase().includes(text)).sort((a, b) => byPriority(a.id, b.id)).slice(0, 12).map(item => item.id)
      : (defaultFocusIds.length ? defaultFocusIds : searchable.filter(item => type(item.id) === "technology").map(item => item.id)).slice(0, 12);
    suggestions.innerHTML = matches.length
      ? matches.map(id => `<a class="chip" href="${hrefFor("explore", id)}">${esc(items.get(id).name)}<span class="visually-hidden"> (${esc(labelOf(id))})</span></a>`).join("")
      : `<p class="muted">Nothing matched “${esc(query)}”. Try one of the skill areas instead.</p>`;
    if (!matches.length && defaultFocusIds.length) {
      suggestions.insertAdjacentHTML("beforeend", defaultFocusIds.slice(0, 8).map(id =>
        `<a class="chip" href="${hrefFor("explore", id)}">${esc(items.get(id).name)}</a>`).join(""));
    }
  }
  search?.addEventListener("input", () => renderSuggestions(search.value));

  const GROUP_TITLES = { where: "Where", built: "What was built", achieved: "What it achieved", tool: "Technologies" };
  function renderExplore(focus, showGraph) {
    if (!result) return;
    if (!suggestions.childElementCount) renderSuggestions(search?.value || "");
    for (const chip of $$(".chip", suggestions)) chip.setAttribute("aria-current", String(chip.getAttribute("href") === hrefFor("explore", focus || "")));
    if (!focus) {
      result.hidden = false;
      $("#focused-graph").hidden = true;
      return;
    }
    const item = items.get(focus);
    const groups = exploreGroups(focus);
    const total = Object.values(groups).reduce((sum, list) => sum + list.length, 0);
    result.innerHTML = `<div class="result-head"><div><p class="overline">${esc(labelOf(focus))}</p><h3 class="title-large">${esc(item.name)}</h3><p class="muted">${total ? `${total} connected records` : "No explicit relationships connect this record yet."}</p></div><div class="actions"><a class="button filled" href="${hrefFor("explore/graph", focus)}">Open focused graph</a><a class="button text" href="${hrefFor("entity", focus)}">Details</a></div></div>` +
      (total ? `<div class="groups">${Object.entries(groups).filter(([, list]) => list.length).map(([kind, list]) =>
        `<section class="group card ${kind}"><h3 class="title-small">${GROUP_TITLES[kind]}</h3><ul>${list.slice(0, 12).map(id =>
          `<li><a class="record-link" href="${hrefFor("entity", id)}">${esc(items.get(id).name)}</a></li>`).join("")}</ul>${list.length > 12 ? `<p class="muted label-small">and ${list.length - 12} more in All records</p>` : ""}</section>`).join("")}</div>` : "");
    // The focused graph replaces the grouped lists; its panel carries the same connections as text.
    result.hidden = Boolean(showGraph);
    $("#focused-graph").hidden = !showGraph;
    if (showGraph) {
      graph.focus(focus);
      $("#focused-graph").scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  }

  // ---- Focused graph: the selected record and its direct neighbours only ----
  const MAX_GRAPH_NEIGHBOURS = 24;
  const graph = {
    instance: null,
    trail: [],
    colours() {
      const styles = getComputedStyle(root);
      const token = name => styles.getPropertyValue(name).trim();
      return {
        where: token("--tertiary"), built: token("--primary"), achieved: token("--success"), tool: token("--outline"),
        other: token("--outline-variant"), text: token("--on-surface"), edge: token("--outline-variant"), surface: token("--surface-low"),
      };
    },
    style() {
      const c = this.colours();
      return [
        { selector: "node", style: { "background-color": ele => c[ele.data("kind")] || c.other, label: "data(label)", color: c.text,
          "font-size": 11, "text-valign": "bottom", "text-margin-y": 6, "text-wrap": "ellipsis", "text-max-width": 130,
          width: 22, height: 22, "text-background-color": c.surface, "text-background-opacity": 0.85, "text-background-padding": 2 } },
        { selector: "node.focus", style: { width: 46, height: 46, "font-size": 13, "font-weight": 600, "border-width": 4, "border-color": c.surface } },
        { selector: "edge", style: { width: 1.5, "line-color": c.edge, "curve-style": "straight" } },
        { selector: "node:selected", style: { "border-width": 3, "border-color": c.text } },
      ];
    },
    restyle() { this.instance?.style(this.style()); },
    focus(id) {
      const at = this.trail.indexOf(id);
      this.trail = at >= 0 ? this.trail.slice(0, at + 1) : [...this.trail, id];
      const near = neighbours(id).sort(byPriority).slice(0, MAX_GRAPH_NEIGHBOURS);
      const shown = new Set([id, ...near]);
      const edges = near.map(other => ({ data: { id: `${id}→${other}`, source: id, target: other } }));
      for (const a of near) for (const b of adjacency.get(a) || []) {
        if (shown.has(b) && b !== id && a < b) edges.push({ data: { id: `${a}→${b}`, source: a, target: b } });
      }
      const elements = [...shown].map(node => ({ data: { id: node, label: items.get(node).name, kind: kindOf(node) }, classes: node === id ? "focus" : "" }))
        .concat(edges);
      if (typeof cytoscape !== "function") return this.panel(id, near);
      if (!this.instance) {
        this.instance = cytoscape({ container: $("#graph-canvas"), elements: [], style: this.style(), minZoom: 0.3, maxZoom: 1.4 });
        this.instance.on("tap", "node", event => {
          const target = event.target.id();
          location.hash = target === this.trail.at(-1) ? hrefFor("entity", target) : hrefFor("explore/graph", target);
        });
      }
      this.instance.elements().remove();
      this.instance.add(elements);
      this.instance.layout({ name: "concentric", concentric: node => node.hasClass("focus") ? 2 : 1, levelWidth: () => 1,
        minNodeSpacing: 28, animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches, animationDuration: 250 }).run();
      this.panel(id, near);
    },
    panel(id, near) {
      const item = items.get(id);
      $("#graph-trail").innerHTML = this.trail.map((step, index) => index === this.trail.length - 1
        ? `<span aria-current="location">${esc(items.get(step).name)}</span>`
        : `<button type="button" data-graph-step="${esc(step)}">${esc(items.get(step).name)}</button><span aria-hidden="true">›</span>`).join("");
      $("#graph-exit").setAttribute("href", hrefFor("explore", id));
      $("#graph-node").innerHTML = `<p class="overline">${esc(labelOf(id))}</p><h3 class="title-medium">${esc(item.name)}</h3>` +
        (item.summary ? `<p class="muted">${esc(item.summary)}</p>` : "") +
        `<a class="button tonal compact" href="${hrefFor("entity", id)}">Open details</a>` +
        `<h4 class="title-small">Connected (${near.length})</h4><ul>${near.map(other =>
          `<li><button type="button" data-graph-step="${esc(other)}">${esc(items.get(other).name)} <span class="muted label-small">${esc(labelOf(other))}</span></button></li>`).join("")}</ul>`;
    },
  };
  document.addEventListener("click", event => {
    const step = event.target.closest("[data-graph-step]");
    if (step) location.hash = hrefFor("explore/graph", step.dataset.graphStep);
  });

  // ---- Record sheet ----
  const sheet = $("#record-sheet"), scrim = $("#sheet-scrim"), sheetBody = $("#sheet-body");
  let opener = null;
  function openSheet(id) {
    const item = items.get(id);
    if (!sheet.hidden && sheet.dataset.record === id) return;
    if (sheet.hidden) opener = document.activeElement;
    sheet.dataset.record = id;
    const links = data.links.filter(link => link.targetRecordId === id);
    const grouped = {};
    for (const other of neighbours(id).sort(byPriority)) (grouped[labelOf(other)] ||= []).push(other);
    sheetBody.innerHTML = `<p class="overline">${esc(labelOf(id))}${featured(id) ? " · Featured" : ""}</p><h2 class="headline-small" id="sheet-title">${esc(item.name)}</h2>` +
      (item.summary ? `<p>${esc(item.summary)}</p>` : "") +
      (item.details.length ? `<dl>${item.details.map(detail => `<div><dt>${esc(detail.label)}</dt><dd>${esc(detail.value)}</dd></div>`).join("")}</dl>` : "") +
      (links.length ? `<h3 class="title-small">Links</h3><ul>${links.map(link => `<li><a href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">${esc(link.label)}</a></li>`).join("")}</ul>` : "") +
      `<div class="actions"><a class="button filled compact" href="${hrefFor("explore", id)}">Explore connections</a><a class="button outlined compact" href="${hrefFor("explore/graph", id)}">Show in graph</a></div>` +
      Object.entries(grouped).map(([label, ids]) => `<h3 class="title-small">${esc(label)}</h3><ul class="connections">${ids.map(other =>
        `<li><a class="record-link" href="${hrefFor("entity", other)}">${esc(items.get(other).name)}</a></li>`).join("")}</ul>`).join("");
    sheet.hidden = false;
    scrim.hidden = false;
    sheetBody.scrollTop = 0;
    $("#sheet-close").focus();
  }
  function closeSheet(navigate = true) {
    if (sheet.hidden) return;
    sheet.hidden = true;
    scrim.hidden = true;
    delete sheet.dataset.record;
    if (navigate) history.pushState(null, "", returnHash);
    if (opener && document.contains(opener)) opener.focus();
    opener = null;
    if (navigate) route();
  }
  $("#sheet-close").addEventListener("click", () => closeSheet());
  scrim.addEventListener("click", () => closeSheet());
  document.addEventListener("keydown", event => {
    if (sheet.hidden) return;
    if (event.key === "Escape") { event.preventDefault(); closeSheet(); return; }
    if (event.key !== "Tab") return;
    const focusable = $$("a[href], button:not([disabled]), input, [tabindex]:not([tabindex='-1'])", sheet);
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  // ---- Records filter, copy buttons, print ----
  $("#records-search")?.addEventListener("input", event => {
    const text = event.target.value.toLowerCase();
    for (const row of $$("#records-body tr")) row.hidden = !row.textContent.toLowerCase().includes(text);
  });
  document.addEventListener("click", async event => {
    const button = event.target.closest("[data-copy]");
    if (!button) return;
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      button.setAttribute("aria-label", "Copied");
    } catch {
      button.setAttribute("aria-label", "Copy failed — select the question text instead");
    }
  });
  window.addEventListener("beforeprint", () => { for (const details of $$("details")) details.open = true; });

  window.addEventListener("hashchange", () => route());
  window.matchMedia("(min-width: 840px)").addEventListener("change", () => { if (lastDestination === "career") showRole(parseRoute().role); });
  route(true);
})();

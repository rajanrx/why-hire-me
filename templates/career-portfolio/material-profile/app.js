/* Why Hire Me — material-profile runtime. Plain ES2020, no network access; Cytoscape is bundled before this file. */
(() => {
  "use strict";

  const root = document.documentElement;
  root.classList.add("js");
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const esc = value => String(value).replace(/[&<>"']/g, character =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  // Badges are SVG built by the renderer from bundled icon data, never from visitor or record text.
  const techIcon = id => data?.technologyIcons?.[id] ?? "";
  const hrefFor = (prefix, id) => `#${prefix}/${encodeURIComponent(id)}`;

  // ---- Theme: system by default, remembered override when storage is available ----
  const THEME_KEY = "why-hire-me-theme";
  const storage = {
    get() { try { return localStorage.getItem(THEME_KEY); } catch { return null; } },
    set(value) { try { localStorage.setItem(THEME_KEY, value); } catch { /* private mode: keep in memory */ } },
  };
  const savedTheme = storage.get();
  // Wide navigation collapses to a rail; the choice is remembered like the theme.
  const NAV_KEY = "why-hire-me-nav";
  const navToggle = $("#nav-toggle");
  const setNav = collapsed => {
    if (collapsed) root.dataset.nav = "collapsed"; else delete root.dataset.nav;
    navToggle?.setAttribute("aria-expanded", String(!collapsed));
    navToggle?.setAttribute("aria-label", collapsed ? "Expand navigation" : "Collapse navigation");
  };
  try { setNav(localStorage.getItem(NAV_KEY) === "collapsed"); } catch { setNav(false); }
  navToggle?.addEventListener("click", () => {
    const collapsed = root.dataset.nav !== "collapsed";
    setNav(collapsed);
    try { localStorage.setItem(NAV_KEY, collapsed ? "collapsed" : "expanded"); } catch { /* memory only */ }
    setTimeout(() => graph.instance?.resize(), 300);
  });
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
      ? matches.map(id => `<a class="chip" href="${hrefFor("explore", id)}">${techIcon(id)}${esc(items.get(id).name)}<span class="visually-hidden"> (${esc(labelOf(id))})</span></a>`).join("")
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
          `<li><a class="record-link" href="${hrefFor("entity", id)}">${techIcon(id)}${esc(items.get(id).name)}</a></li>`).join("")}</ul>${list.length > 12 ? `<p class="muted label-small">and ${list.length - 12} more in All records</p>` : ""}</section>`).join("")}</div>` : "");
    // The focused graph replaces the grouped lists; its panel carries the same connections as text.
    result.hidden = Boolean(showGraph);
    $("#focused-graph").hidden = !showGraph;
    if (showGraph) {
      graph.focus(focus);
      $("#focused-graph").scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  }

  // ---- Focused graph: starts at one record; selecting a node expands it in place ----
  const MAX_EXPANSION = 12;
  const MAX_GRAPH_NODES = 120;
  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const graph = {
    instance: null,
    origin: null,
    depth: new Map(),   // node id -> rings from the origin
    expanded: [],       // expansion order, shown as the trail
    parentOf: new Map(), // node id -> the expanded node that first revealed it (the layout tree)
    labelSide: new Map(), // node id -> which side its label sits on
    selected: null,
    colours() {
      const styles = getComputedStyle(root);
      const token = name => styles.getPropertyValue(name).trim();
      return {
        where: token("--tertiary"), built: token("--primary"), achieved: token("--success"), tool: token("--outline"),
        other: token("--outline-variant"), text: token("--on-surface"), edge: token("--outline-variant"), surface: token("--surface-lowest"),
      };
    },
    /** Node image: the company logo, the technology's brand badge, or the kind's icon. */
    nodeImage(id) {
      const logo = logoFor(id);
      if (logo && ["engagement", "organisation", "role"].includes(type(id))) return logo;
      const glyph = data.technologyGlyphs?.[id];
      if (glyph) {
        const colour = glyph.colour ?? data.graphKinds?.tool?.colour ?? "#b08850";
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48"><path fill="${colour}" d="${glyph.path}"/></svg>`;
        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
      }
      return data.graphKinds?.[kindOf(id)]?.image ?? data.graphKinds?.other?.image;
    },
    style() {
      const c = this.colours();
      const kindColour = ele => data.graphKinds?.[ele.data("kind")]?.colour ?? data.graphKinds?.other?.colour;
      return [
        { selector: "node", style: { "background-color": kindColour, "background-opacity": 0.14, "border-width": 1.5,
          "border-color": kindColour, "background-image": "data(image)", "background-width": "58%", "background-height": "58%",
          "background-fit": "none", "background-clip": "node", width: 40, height: 40, label: "", color: c.text,
          "font-size": 11, "text-valign": "bottom", "text-margin-y": 6, "text-wrap": "ellipsis", "text-max-width": 140,
          "text-background-color": c.surface, "text-background-opacity": 0.9, "text-background-padding": 3,
          "text-background-shape": "roundrectangle", "transition-property": "opacity", "transition-duration": 150 } },
        { selector: "node.labelled, node.hover", style: { label: "data(label)", "z-index": 10 } },
        { selector: 'node[side = "right"]', style: { "text-halign": "right", "text-valign": "center", "text-margin-x": 8, "text-margin-y": 0 } },
        { selector: 'node[side = "left"]', style: { "text-halign": "left", "text-valign": "center", "text-margin-x": -8, "text-margin-y": 0 } },
        { selector: 'node[side = "top"]', style: { "text-valign": "top", "text-margin-y": -6 } },
        { selector: ".faded", style: { opacity: 0.28 } },
        { selector: "node[?logo]", style: { "background-color": "#ffffff", "background-opacity": 1, "background-width": "64%", "background-height": "64%" } },
        { selector: "node.expanded", style: { width: 48, height: 48, "font-weight": 600 } },
        { selector: "node.origin", style: { width: 64, height: 64, "border-width": 3 } },
        { selector: "node.selected", style: { "border-width": 3, "border-color": c.text } },
        { selector: "edge", style: { width: 1.5, "line-color": c.edge, "curve-style": "straight" } },
        { selector: "edge.active", style: { width: 2, "line-color": c.built, opacity: 0.8 } },
      ];
    },
    restyle() { this.instance?.style(this.style()); this.scaleLabels(); },
    scaleLabels() {
      if (!this.instance || this.labelFrame) return;
      this.labelFrame = requestAnimationFrame(() => {
        this.labelFrame = null;
        const cy = this.instance, size = Math.min(36, Math.max(11, 12 / cy.zoom()));
        cy.batch(() => {
          cy.nodes().forEach(node => {
            // Keep icons legible when a large graph is fitted: at least ~75% of their designed size on screen.
            const base = node.id() === this.origin ? 64 : node.hasClass("expanded") ? 48 : 40;
            const diameter = Math.max(base, base * 0.75 / cy.zoom());
            node.style({ width: diameter, height: diameter, "font-size": node.id() === this.origin ? size * 1.15 : size,
              "text-max-width": 150 * size / 11 });
          });
        });
      });
    },
    ensureInstance() {
      if (this.instance || typeof cytoscape !== "function") return Boolean(this.instance);
      this.instance = cytoscape({ container: $("#graph-canvas"), elements: [], style: this.style(), minZoom: 0.2, maxZoom: 1.4 });
      this.instance.on("tap", "node", event => this.expand(event.target.id()));
      this.instance.on("mouseover", "node", event => event.target.addClass("hover"));
      // Keep labels at least ~11px on screen whatever the zoom, so a fitted large graph stays readable.
      this.instance.on("zoom", () => this.scaleLabels());
      this.instance.on("mouseout", "node", event => event.target.removeClass("hover"));
      return true;
    },
    /** Start over from one record (route entry point). */
    focus(id) {
      if (this.origin === id && this.instance?.nodes().length) return this.select(id);
      this.origin = id;
      this.depth = new Map([[id, 0]]);
      this.parentOf = new Map();
      this.expanded = [];
      if (this.ensureInstance()) this.instance.elements().remove();
      this.expand(id);
    },
    /** Add a node's neighbours around it, keeping everything already shown. */
    expand(id) {
      if (!this.expanded.includes(id)) {
        this.expanded.push(id);
        const fresh = neighbours(id).filter(other => !this.depth.has(other)).sort(byPriority)
          .slice(0, Math.max(0, Math.min(MAX_EXPANSION, MAX_GRAPH_NODES - this.depth.size)));
        for (const other of fresh) { this.depth.set(other, this.depth.get(id) + 1); this.parentOf.set(other, id); }
        if (this.instance) {
          const add = [];
          for (const node of [id, ...fresh]) if (!this.instance.getElementById(node).length)
            add.push({ data: { id: node, label: items.get(node).name, kind: kindOf(node), image: this.nodeImage(node),
              logo: Boolean(logoFor(node) && ["engagement", "organisation", "role"].includes(type(node))) },
              position: { ...(this.instance.getElementById(this.parentOf.get(node) ?? id).position?.() ?? { x: 0, y: 0 }) } });
          for (const other of neighbours(id)) if (this.depth.has(other)) {
            const key = [id, other].sort().join("→");
            if (!this.instance.getElementById(key).length) add.push({ data: { id: key, source: id, target: other } });
          }
          this.instance.add(add);
          this.instance.getElementById(id).addClass("expanded");
          this.instance.getElementById(this.origin).addClass("origin");
          // A previous expansion may still be animating; stop it so its targets cannot overwrite these.
          this.layoutRun?.stop();
          this.instance.nodes().stop(true, true);
          this.layoutRun = this.instance.layout({ name: "preset", positions: this.radialPositions(), animate: !reducedMotion(),
            animationDuration: 400, animationEasing: "ease-out", fit: true, padding: 48, stop: () => this.scaleLabels() });
          this.layoutRun.run();
        }
      }
      this.select(id);
    },
    /**
     * Radial tree: the origin at the centre, each node's children on the next ring inside a wedge sized by
     * how many leaves hang below it. Clusters stay beside their parent and nothing overlaps.
     */
    radialPositions() {
      // Labels point away from the centre so neighbours on a ring fan apart instead of colliding.
      const sideFor = angle => {
        const x = Math.cos(angle), y = Math.sin(angle);
        return Math.abs(x) > 0.5 ? (x > 0 ? "right" : "left") : (y > 0 ? "bottom" : "top");
      };
      this.labelSide = new Map();
      const children = new Map();
      for (const [child, parent] of this.parentOf) {
        if (!children.has(parent)) children.set(parent, []);
        children.get(parent).push(child);
      }
      const leaves = new Map();
      const countLeaves = node => {
        const kids = children.get(node) ?? [];
        const total = kids.length ? kids.reduce((sum, kid) => sum + countLeaves(kid), 0) : 1;
        leaves.set(node, total);
        return total;
      };
      countLeaves(this.origin);
      // The first ring grows with the number of leaves so neighbouring labels keep ~70px of arc each.
      const first = Math.max(190, leaves.get(this.origin) * 110 / (2 * Math.PI));
      const ring = depth => depth === 0 ? 0 : first + (depth - 1) * 150;
      const positions = {};
      const place = (node, start, end, depth) => {
        const middle = (start + end) / 2, radius = ring(depth);
        positions[node] = { x: radius * Math.cos(middle), y: radius * Math.sin(middle) };
        this.labelSide.set(node, depth === 0 ? "bottom" : sideFor(middle));
        let cursor = start;
        for (const kid of (children.get(node) ?? []).sort((a, b) => order.get(a) - order.get(b))) {
          const share = (end - start) * leaves.get(kid) / leaves.get(node);
          place(kid, cursor, cursor + share, depth + 1);
          cursor += share;
        }
      };
      place(this.origin, -Math.PI / 2, Math.PI * 1.5, 0);
      this.instance?.batch(() => this.instance.nodes().forEach(node => node.data("side", this.labelSide.get(node.id()) ?? "bottom")));
      return positions;
    },
    select(id) {
      this.selected = id;
      if (this.instance) {
        const cy = this.instance, node = cy.getElementById(id), focus = node.closedNeighborhood();
        cy.elements().removeClass("selected labelled faded active");
        node.addClass("selected");
        cy.nodes().filter(other => other.id() === this.origin || this.expanded.includes(other.id())).addClass("labelled");
        focus.nodes().addClass("labelled");
        focus.edges().addClass("active");
        cy.elements().not(focus).not(cy.getElementById(this.origin)).addClass("faded");
      }
      this.panel(id);
    },
    panel(id) {
      const item = items.get(id);
      const near = neighbours(id).sort(byPriority);
      $("#graph-trail").innerHTML = this.expanded.map(step =>
        `<button type="button" data-graph-select="${esc(step)}"${step === id ? ' aria-current="true"' : ""}>${esc(items.get(step).name)}</button>`)
        .join('<span aria-hidden="true">›</span>') +
        (this.expanded.length > 1 ? `<button type="button" class="trail-reset" data-graph-reset>Reset</button>` : "");
      $("#graph-exit").setAttribute("href", hrefFor("explore", this.origin));
      $("#graph-node").innerHTML = `<p class="overline">${esc(labelOf(id))}</p><h3 class="title-medium">${esc(item.name)}</h3>` +
        (item.summary ? `<p class="muted">${esc(item.summary)}</p>` : "") +
        `<a class="button tonal compact" href="${hrefFor("entity", id)}">Open details</a>` +
        `<h4 class="title-small">Connected (${near.length})</h4><p class="muted label-small">Select one to add its connections to the graph.</p><ul>${near.map(other =>
          `<li><button type="button" data-graph-expand="${esc(other)}">${esc(items.get(other).name)} <span class="muted label-small">${esc(labelOf(other))}${this.expanded.includes(other) ? " · expanded" : ""}</span></button></li>`).join("")}</ul>`;
    },
  };
  // Full screen: the Fullscreen API where available, otherwise a fixed overlay; Escape leaves either.
  const graphPanel = $("#focused-graph"), fullscreenButton = $("#graph-fullscreen");
  const setGraphFullscreen = on => {
    graphPanel?.classList.toggle("is-fullscreen", on);
    fullscreenButton?.setAttribute("aria-pressed", String(on));
    const label = fullscreenButton?.querySelector("span");
    if (label) label.textContent = on ? "Exit full screen" : "Full screen";
    setTimeout(() => { graph.instance?.resize(); graph.instance?.fit(undefined, 48); graph.scaleLabels(); }, 120);
  };
  fullscreenButton?.addEventListener("click", async () => {
    const on = !graphPanel.classList.contains("is-fullscreen");
    if (on && graphPanel.requestFullscreen) { try { await graphPanel.requestFullscreen(); } catch { /* overlay fallback */ } }
    else if (!on && document.fullscreenElement) await document.exitFullscreen();
    setGraphFullscreen(on);
  });
  document.addEventListener("fullscreenchange", () => { if (!document.fullscreenElement && graphPanel?.classList.contains("is-fullscreen")) setGraphFullscreen(false); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && graphPanel?.classList.contains("is-fullscreen") && sheet.hidden) setGraphFullscreen(false); });

  document.addEventListener("click", event => {
    const expand = event.target.closest("[data-graph-expand]");
    const select = event.target.closest("[data-graph-select]");
    if (expand) graph.expand(expand.dataset.graphExpand);
    else if (select) {
      graph.select(select.dataset.graphSelect);
      graph.instance?.animate({ center: { eles: graph.instance.getElementById(select.dataset.graphSelect) } }, { duration: reducedMotion() ? 0 : 250 });
    } else if (event.target.closest("[data-graph-reset]")) {
      const origin = graph.origin;
      graph.origin = null;
      graph.focus(origin);
    }
  });

  // ---- Record sheet ----
  const sheet = $("#record-sheet"), scrim = $("#sheet-scrim"), sheetBody = $("#sheet-body");
  let opener = null;
  /** The organisation (or engagement) a record belongs to, for its logo. */
  const logoFor = id => data.logos?.[id] ?? neighbours(id).map(other => data.logos?.[other]).find(Boolean);
  const SOURCE_DETAIL = /evidence|attribution|verification|source|reference/i;
  const rowMark = other => techIcon(other) ||
    (logoFor(other) ? `<span class="row-logo"><img src="${esc(logoFor(other))}" alt="" width="20" height="20"></span>` : `<span class="row-dot k-${kindOf(other)}"></span>`);

  /** A readable record page: lead summary, facts at a glance, links, then connections grouped into cards. */
  function sheetContent(id) {
    const item = items.get(id);
    const facts = item.details.filter(detail => !SOURCE_DETAIL.test(detail.label));
    const source = item.details.filter(detail => SOURCE_DETAIL.test(detail.label));
    const links = data.links.filter(link => link.targetRecordId === id);
    const grouped = {};
    // Reference-link records already appear under Links, so they are not repeated as connections.
    for (const other of neighbours(id).sort(byPriority)) if (type(other) !== "reference link") (grouped[labelOf(other)] ||= []).push(other);
    const logo = data.logos?.[id];
    return `<header class="sheet-head">${logo ? `<span class="avatar logo sheet-logo"><img src="${esc(logo)}" alt="" width="36" height="36"></span>` : ""}<div>
        <p class="overline">${esc(labelOf(id))}${featured(id) ? ' · <span class="featured-tag">Featured</span>' : ""}</p>
        <h2 class="sheet-title" id="sheet-title">${esc(item.name)}</h2></div></header>` +
      `<div class="actions"><a class="button filled compact" href="${hrefFor("explore", id)}">Explore connections</a><a class="button outlined compact" href="${hrefFor("explore/graph", id)}">Show in graph</a></div>` +
      (item.summary ? `<p class="sheet-lead">${esc(item.summary)}</p>` : "") +
      (facts.length ? `<section class="sheet-facts" aria-label="At a glance"><h3 class="overline">At a glance</h3><dl>${facts.map(detail =>
        `<div><dt>${esc(detail.label)}</dt><dd>${esc(detail.value)}</dd></div>`).join("")}</dl></section>` : "") +
      (links.length ? `<section class="sheet-links"><h3 class="overline">Links</h3>${links.map(link =>
        `<a class="sheet-link" href="${esc(link.url)}" target="_blank" rel="noopener noreferrer"><span>${esc(link.label)}</span><span class="muted label-small">${esc(new URL(link.url).hostname.replace(/^www\./, ""))} ↗</span></a>`).join("")}</section>` : "") +
      (Object.keys(grouped).length ? `<h3 class="overline sheet-section">Connected</h3><div class="sheet-groups">${Object.entries(grouped).map(([label, ids]) =>
        `<section class="sheet-group"><h4>${esc(label)} <span class="muted">${ids.length}</span></h4><ul>${ids.map(other =>
          `<li><a class="sheet-row" href="${hrefFor("entity", other)}">${rowMark(other)}<span>${esc(items.get(other).name)}</span><span class="sheet-row-go" aria-hidden="true">›</span></a></li>`).join("")}</ul></section>`).join("")}</div>` : "") +
      (source.length ? `<p class="sheet-source label-medium">Source · ${source.map(detail => esc(`${detail.label}: ${detail.value}`)).join(" · ")}</p>` : "");
  }

  function openSheet(id) {
    // Record details live outside the graph, so leave full screen before showing them.
    if (graphPanel?.classList.contains("is-fullscreen")) {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      setGraphFullscreen(false);
    }
    if (!sheet.hidden && sheet.dataset.record === id) return;
    if (sheet.hidden) opener = document.activeElement;
    sheet.dataset.record = id;
    sheetBody.innerHTML = sheetContent(id);
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

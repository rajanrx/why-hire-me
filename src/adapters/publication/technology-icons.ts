import { createRequire } from "node:module";

interface SimpleIcon { readonly title: string; readonly slug: string; readonly path: string; readonly hex: string }
// Loaded untyped, like the bundled Cytoscape: the package's own declarations fail strict lib checks.
const simpleIcons = createRequire(import.meta.url)("simple-icons") as Record<string, unknown>;

/** Brand marks from Simple Icons (CC0-1.0), indexed by slug and normalised title. */
const brands = new Map<string, SimpleIcon>();
for (const icon of Object.values(simpleIcons) as unknown[]) {
  if (typeof icon !== "object" || icon === null || !("path" in icon)) continue;
  const brand = icon as SimpleIcon;
  brands.set(brand.slug, brand);
  brands.set(normalise(brand.title), brand);
}

function normalise(value: string): string {
  return value.toLowerCase().replace(/\+/g, "plus").replace(/#/g, "sharp").replace(/\./g, "dot").replace(/[^a-z0-9]/g, "");
}

/** Common short names whose Simple Icons slug differs; `null` deliberately means "no brand". */
const ALIASES: Readonly<Record<string, string | null>> = {
  postgres: "postgresql", gcp: "googlecloud", argocd: "argo", reactnative: "react", java: "openjdk",
  nats: "natsdotio", cube: "cubedotdev", llm: null, ai: null, analytics: null, data: null,
};
/** Vendor prefixes Simple Icons uses for product slugs (e.g. Kafka → apachekafka). */
const SLUG_VARIANTS = [(n: string) => n, (n: string) => `apache${n}`, (n: string) => `${n}dotio`, (n: string) => `${n}dotdev`];

/** Material Symbols-style glyphs for concepts without a brand, chosen from the reviewed category name. */
const CATEGORY_GLYPHS: readonly (readonly [RegExp, string])[] = [
  [/language|code|programming/i, "M8 17 3 12l5-5 1.4 1.4L5.8 12l3.6 3.6L8 17Zm8 0-1.4-1.4 3.6-3.6-3.6-3.6L16 7l5 5-5 5Z"],
  [/\bai\b|machine|learning|intelligen/i, "m12 1 2.6 6.4L21 10l-6.4 2.6L12 19l-2.6-6.4L3 10l6.4-2.6L12 1Zm7 13 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z"],
  [/cloud|platform|infra/i, "M6.5 20q-2.3 0-3.9-1.6T1 14.5q0-2 1.2-3.5T5.4 9.1q.6-2.3 2.5-3.7T12 4q2.9 0 4.9 2t2 4.9q1.7.2 2.9 1.5t1.2 3.1q0 1.9-1.3 3.2T18.5 20h-12Z"],
  [/data|analytic|database|storage/i, "M12 11q-3.8 0-6.4-1.2T3 7q0-1.6 2.6-2.8T12 3q3.8 0 6.4 1.2T21 7q0 1.6-2.6 2.8T12 11Zm0 5q-3.8 0-6.4-1.2T3 12V9.5q0 1.1 1 1.9t2.6 1.3q1.6.5 3.1.7t2.3.1q.9 0 2.3-.1t3.1-.7q1.5-.5 2.6-1.3t1-1.9V12q0 1.6-2.6 2.8T12 16Zm0 5q-3.8 0-6.4-1.2T3 17v-2.5q0 1.1 1 1.9t2.6 1.3q1.6.5 3.1.7t2.3.1q.9 0 2.3-.1t3.1-.7q1.5-.5 2.6-1.3t1-1.9V17q0 1.6-2.6 2.8T12 21Z"],
  [/messag|event|stream|queue/i, "M4 18v-2h10v2H4Zm0-5v-2h16v2H4Zm0-5V6h16v2H4Z"],
  [/interface|api|integration/i, "M6 22q-1.3 0-2.1-.9T3 19q0-1.3.9-2.1T6 16q.4 0 .7.1l.6.2 4.2-5.3q-.4-.5-.6-1T10.6 9q0-1.3.9-2.1T13.6 6q1.3 0 2.1.9t.9 2.1q0 .5-.2 1t-.5.9l3 3.6q.3-.1.5-.1h.6q1.3 0 2.1.9T23 17q0 1.3-.9 2.1T20 20q-1.3 0-2.1-.9T17 17q0-.4.1-.8l.3-.7-3-3.6-.4.1h-.8L9 17.3q.4.4.7 1t.3 1.4q0 1.3-.9 2.1T6 22Z"],
  [/architect|delivery|engineering|practice|security/i, "M4 21v-2h3V9H4V7l8-4 8 4v2h-3v10h3v2H4Zm5-2h2v-8H9v8Zm4 0h2v-8h-2v8Z"],
  [/commerce|payment|retail|operation|hospitality/i, "M4 20v-8H3v-2l1-5h16l1 5v2h-1v8h-2v-8h-4v8H4Zm2-2h6v-6H6v6Z"],
];
const DEFAULT_GLYPH = "M12 21.4 2.6 12V3h9l9.4 9.4-9 9ZM6.5 8q.6 0 1.1-.4T8 6.5q0-.6-.4-1.1T6.5 5q-.6 0-1.1.4T5 6.5q0 .6.4 1.1t1.1.4Z";

function brandFor(name: string): SimpleIcon | undefined {
  const key = normalise(name);
  const alias = ALIASES[key];
  if (alias === null) return undefined;
  return alias !== undefined ? brands.get(alias) : SLUG_VARIANTS.map(variant => brands.get(variant(key))).find(Boolean);
}

/** SVG path (24×24 viewBox) for a technology: its brand mark when one exists, else a category glyph. */
export function technologyIconPath(name: string, category: string | null): string {
  return brandFor(name)?.path
    ?? CATEGORY_GLYPHS.find(([pattern]) => pattern.test(category ?? ""))?.[1] ?? DEFAULT_GLYPH;
}

/** Relative luminance of a #RRGGBB colour (WCAG). */
function luminance(hex: string): number {
  const [r, g, b] = [0, 2, 4].map(offset => {
    const channel = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** The bare mark and its ink colour (`null` for concept glyphs, which take the page or graph colour). */
export function technologyGlyph(name: string, category: string | null): { readonly path: string; readonly colour: string | null } {
  const brand = brandFor(name);
  if (!brand || !/^[0-9a-f]{6}$/i.test(brand.hex)) return { path: technologyIconPath(name, category), colour: null };
  const light = luminance(brand.hex);
  return { path: brand.path, colour: `#${light > 0.55 ? darken(brand.hex, 0.45) : light > 0.35 ? darken(brand.hex, 0.2) : brand.hex}` };
}

/** Darkens a #RRGGBB colour towards black by `amount` (0–1). */
function darken(hex: string, amount: number): string {
  return [0, 2, 4].map(offset => Math.round(parseInt(hex.slice(offset, offset + 2), 16) * (1 - amount))
    .toString(16).padStart(2, "0")).join("");
}

/**
 * A 24×24 badge in the LogicBook style: a soft tint of the brand colour in a circle with the mark in
 * the brand colour (darkened when the brand is too light to read on its own tint). Concepts without a
 * brand use the page's accent roles via CSS classes. Colours are SVG presentation attributes, so the
 * page's strict style-src policy still holds.
 */
export function technologyBadge(name: string, category: string | null): string {
  const brand = brandFor(name);
  const glyph = (fill: string) => `<g transform="translate(6 6) scale(.5)"><path ${fill} d="${technologyIconPath(name, category)}"/></g>`;
  if (!brand || !/^[0-9a-f]{6}$/i.test(brand.hex))
    return `<svg class="tech-badge" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle class="badge-bg" cx="12" cy="12" r="12"/>${glyph('class="badge-fg"')}</svg>`;
  const light = luminance(brand.hex);
  const ink = light > 0.55 ? darken(brand.hex, 0.45) : light > 0.35 ? darken(brand.hex, 0.2) : brand.hex;
  return `<svg class="tech-badge" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle fill="#${brand.hex}" fill-opacity=".16" cx="12" cy="12" r="12"/>${glyph(`fill="#${ink}"`)}</svg>`;
}

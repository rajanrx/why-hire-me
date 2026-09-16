export interface PrototypeCarryForwardLocator {
  readonly baselineItemId: string;
  readonly itemType?: string;
  readonly disposition: string;
  readonly newLocator: string | null;
}

export type CandidateOutput = string | Uint8Array;

type DisplayItem = { readonly id?: unknown; readonly name?: unknown; readonly type?: unknown;
  readonly summary?: unknown; readonly details?: readonly { readonly label?: unknown }[] };
type DisplayRelation = { readonly id?: unknown; readonly subject?: unknown; readonly object?: unknown;
  readonly predicate?: unknown };
type DisplayLink = { readonly id?: unknown; readonly label?: unknown; readonly targetRecordId?: unknown };

function decoded(value: string): string {
  try { return decodeURIComponent(value); } catch { return value; }
}

function pdfPageExists(bytes: CandidateOutput, fragment: string): boolean {
  const match = /^page=(\d+)$/.exec(fragment);
  if (!match) return false;
  const body = typeof bytes === "string" ? bytes : new TextDecoder("latin1").decode(bytes);
  const pages = body.match(/\/Type\s*\/Page\b/g)?.length ?? 0;
  return Number(match[1]) > 0 && Number(match[1]) <= pages;
}

function portfolioFragmentExists(contents: string, fragment: string): boolean {
  let parsed: Record<string, unknown>;
  try { parsed = JSON.parse(contents) as Record<string, unknown>; } catch { return false; }
  const model = (parsed.displayModel ?? parsed) as Record<string, unknown>;
  const items = Array.isArray(model.items) ? model.items as DisplayItem[] : [];
  const relations = Array.isArray(model.relations) ? model.relations as DisplayRelation[] : [];
  const links = Array.isArray(model.links) ? model.links as DisplayLink[] : [];
  const assets = Array.isArray(model.assets) ? model.assets as { outputPath?: unknown }[] : [];
  const itemById = new Map(items.map(item => [String(item.id), item]));
  const itemByName = new Map(items.map(item => [String(item.name).toLocaleLowerCase(), item]));
  const parts = fragment.split("/").map(decoded);
  const [group, first, second] = parts;
  if (group === undefined) return false;
  const itemNamed = (value: string | undefined) => value !== undefined &&
    (itemById.has(value) || itemByName.has(value.toLocaleLowerCase()));
  const related = (a: string, b: string) => relations.some(relation =>
    (relation.subject === a && relation.object === b) || (relation.subject === b && relation.object === a));
  const itemIdFor = (value: string | undefined) => value === undefined ? null :
    itemById.has(value) ? value : String(itemByName.get(value.toLocaleLowerCase())?.id ?? "") || null;

  if (["items", "records", "achievementRecords", "details"].includes(group)) return itemNamed(first);
  if (group === "relations") return relations.some(relation => relation.id === first);
  if (group === "links" || group === "references") return links.some(link => link.id === first) &&
    (second === undefined || links.some(link => link.id === first &&
      (String(link.label).toLocaleLowerCase().includes(second.toLocaleLowerCase()) ||
        link.targetRecordId === second || ["profile", "credential", "publication"].includes(second))));
  if (group === "assets") return assets.some(asset => asset.outputPath === first);
  if (group === "person") {
    const person = items.find(item => String(item.type).toLocaleLowerCase() === "person");
    return Boolean(person && first && related(String(person.id), first));
  }
  if (group === "summaries" && first) {
    const [source, target] = first.split("->");
    return Boolean(source && target && relations.some(relation => relation.subject === source &&
      relation.object === target && String(relation.predicate).includes("summarised_under")));
  }
  if (group === "roles" && first && second) {
    const engagement = itemById.get(first);
    if (!engagement) return false;
    if (second === "summary") return typeof engagement.summary === "string" && engagement.summary.trim().length > 0;
    if (second === "role") return relations.some(relation => relation.subject === first &&
      itemById.get(String(relation.object))?.type === "Role");
    if (second === "dates") return engagement.details?.some(detail =>
      /date|period|tenure/i.test(String(detail.label))) ?? false;
    return false;
  }
  if (group === "recordTech" && first && second) {
    const technologyId = itemIdFor(second);
    if (!itemById.has(first) || !technologyId) return false;
    if (related(first, technologyId)) return true;
    const bridges = relations.flatMap(relation => relation.subject === first ? [String(relation.object)] :
      relation.object === first ? [String(relation.subject)] : []);
    return bridges.some(bridge => related(bridge, technologyId));
  }
  if (group === "categories" && first && second) {
    const categoryId = itemIdFor(first), technologyId = itemIdFor(second);
    return Boolean(categoryId && technologyId && related(categoryId, technologyId));
  }
  if (itemById.has(group) && first) return related(group, first);
  return false;
}

function locatorExists(locator: string, outputs: ReadonlyMap<string, CandidateOutput>): boolean {
  const hash = locator.indexOf("#");
  const path = (hash < 0 ? locator : locator.slice(0, hash)).replace(/^\.\//, "");
  const fragment = hash < 0 ? "" : locator.slice(hash + 1);
  if (!path || path.startsWith("/") || path.split("/").includes("..")) return false;
  const contents = outputs.get(path);
  if (contents === undefined) return false;
  if (!fragment) return true;
  if (path === "portfolio.json" && typeof contents === "string") return portfolioFragmentExists(contents, fragment);
  if (path.endsWith(".pdf")) return pdfPageExists(contents, fragment);
  if (path.endsWith(".html") && typeof contents === "string") {
    const anchor = decoded(fragment).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\bid=["']${anchor}["']`).test(contents);
  }
  return false;
}

/** A carry-forward claim must resolve to a real file and, when present, a real record or anchor. */
export function invalidCarryForwardLocators(
  entries: readonly PrototypeCarryForwardLocator[],
  outputs: ReadonlyMap<string, CandidateOutput>,
): readonly PrototypeCarryForwardLocator[] {
  return entries.filter(entry => entry.disposition !== "excluded").filter(entry => {
    const alternatives = (entry.newLocator ?? "").split(";").map(value => value.trim()).filter(Boolean);
    const requiresTarget = entry.itemType !== "asset";
    return alternatives.length === 0 || !alternatives.some(locator =>
      (!requiresTarget || locator.includes("#")) && locatorExists(locator, outputs));
  });
}

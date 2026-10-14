import type {
  CareerPortfolioDisplayItem as Item,
  CareerPortfolioDisplayModel,
} from "../../domains/publication/domain/career-portfolio-display.js";

/** A record reference the page can render and link without reinterpreting text. */
export interface ProfileRef { readonly id: string; readonly name: string; readonly type: string }

export interface ProfileRole {
  readonly id: string;
  readonly title: string;
  readonly organisation: string;
  readonly period: string | null;
  readonly summary: string | null;
  readonly outcomes: readonly ProfileRef[];
  readonly featuredWork: readonly ProfileRef[];
  readonly moreWork: readonly ProfileRef[];
  readonly technologies: readonly ProfileRef[];
}

export interface ProfileCategory {
  readonly id: string | null;
  readonly name: string;
  readonly technologies: readonly (ProfileRef & { readonly usedAt: readonly string[] })[];
}

export interface CareerProfileView {
  readonly name: string;
  readonly personId: string | null;
  readonly headline: string | null;
  readonly location: string | null;
  readonly impact: readonly ProfileRef[];
  readonly roles: readonly ProfileRole[];
  readonly categories: readonly ProfileCategory[];
  readonly credentials: readonly ProfileRef[];
  readonly notebookUrl: string | null;
  readonly linkedInUrl: string | null;
  readonly resumePath: string | null;
  readonly audioPath: string | null;
}

const WORK_TYPES = new Set(["work", "contribution"]);
const OUTCOME = "reported outcome";
/** Intermediate records that only connect a technology to its context. */
const BRIDGE_TYPES = new Set(["technologyuse"]);
const MAX_FEATURED_WORK = 3;
const MAX_IMPACT = 4;

const kind = (item: Item | undefined) => item?.type.toLowerCase() ?? "";
const ref = (item: Item): ProfileRef => ({ id: item.id, name: item.name, type: item.type });
const unique = <T extends { id: string }>(values: readonly T[]) =>
  [...new Map(values.map(value => [value.id, value])).values()];

/**
 * Builds the evaluator-facing profile from explicit relationships only. Traversal is by record type,
 * never by predicate name or record ID, so any person's reviewed data drives the same layout.
 */
export function careerProfileView(display: CareerPortfolioDisplayModel): CareerProfileView {
  const byId = new Map(display.items.map(item => [item.id, item]));
  const adjacency = new Map<string, Item[]>();
  for (const relation of display.relations) {
    const subject = byId.get(relation.subject), object = byId.get(relation.object);
    if (!subject || !object) continue;
    adjacency.set(subject.id, [...adjacency.get(subject.id) ?? [], object]);
    adjacency.set(object.id, [...adjacency.get(object.id) ?? [], subject]);
  }
  const near = (id: string, type?: string) =>
    (adjacency.get(id) ?? []).filter(item => type === undefined || kind(item) === type);
  const technologiesOf = (id: string) => near(id).flatMap(item =>
    kind(item) === "technology" ? [item] : BRIDGE_TYPES.has(kind(item)) ? near(item.id, "technology") : []);
  const isFeatured = (item: Item | undefined) => item?.inclusion?.status === "featured";
  const order = new Map(display.items.map((item, index) => [item.id, index]));
  const byPriority = (a: Item, b: Item) =>
    Number(!isFeatured(a)) - Number(!isFeatured(b)) || order.get(a.id)! - order.get(b.id)!;

  const roles = display.items.filter(item => kind(item) === "engagement").map((engagement): ProfileRole => {
    const direct = near(engagement.id);
    const work = direct.filter(item => WORK_TYPES.has(kind(item)) && item.inclusion !== null);
    const records = unique([...direct, ...work.flatMap(item => near(item.id))]);
    const ordered = work.sort(byPriority);
    const featured = ordered.filter(isFeatured).slice(0, MAX_FEATURED_WORK);
    const shownWork = featured.length ? featured : ordered.slice(0, MAX_FEATURED_WORK);
    const period = engagement.details.find(detail => /date|period|tenure|timeline/i.test(detail.label));
    return {
      id: engagement.id,
      title: direct.find(item => kind(item) === "role")?.name ?? engagement.name,
      organisation: direct.find(item => kind(item) === "organisation")?.name ?? "",
      period: period?.value ?? null,
      summary: engagement.summary,
      outcomes: records.filter(item => kind(item) === OUTCOME && item.inclusion !== null).sort(byPriority).map(ref),
      featuredWork: shownWork.map(ref),
      moreWork: ordered.filter(item => !shownWork.includes(item)).map(ref),
      technologies: unique([engagement, ...records].flatMap(item => technologiesOf(item.id))).map(ref),
    };
  });

  // Featured outcomes first, then at most one outcome per featured record it is summarised under.
  const outcomes = display.items.filter(item => kind(item) === OUTCOME && item.inclusion);
  const usedParents = new Set<string>();
  const impact = [
    ...outcomes.filter(isFeatured),
    ...display.items.filter(isFeatured).flatMap(parent => {
      const child = outcomes.find(item => item.inclusion!.summarisedUnderRecordId === parent.id);
      if (!child || usedParents.has(parent.id)) return [];
      usedParents.add(parent.id);
      return [child];
    }),
  ].slice(0, MAX_IMPACT).map(ref);

  const roleLabel = new Map(roles.map(role => [role.id, role.organisation || role.title]));
  const usedAt = (technology: Item) => [...new Set(roles
    .filter(role => role.technologies.some(item => item.id === technology.id))
    .map(role => roleLabel.get(role.id)!))];
  const technologies = display.items.filter(item => kind(item) === "technology");
  const categorised = new Set<string>();
  const categories: ProfileCategory[] = display.items.filter(item => kind(item) === "technologycategory")
    .map(category => {
      const members = near(category.id, "technology");
      members.forEach(item => categorised.add(item.id));
      return { id: category.id, name: category.name,
        technologies: members.map(item => ({ ...ref(item), usedAt: usedAt(item) })) };
    })
    .filter(category => category.technologies.length > 0);
  const other = technologies.filter(item => !categorised.has(item.id));
  if (other.length) categories.push({ id: null, name: categories.length ? "Other" : "Technologies",
    technologies: other.map(item => ({ ...ref(item), usedAt: usedAt(item) })) });

  const person = display.items.find(item => kind(item) === "person");
  const link = (predicate: (label: string) => boolean) =>
    display.links.find(item => item.targetRecordId === null && predicate(item.label.trim().toLowerCase()));
  return {
    name: display.subjectDisplayName,
    personId: person?.id ?? null,
    headline: person?.summary ?? null,
    location: person?.details.find(detail => /location/i.test(detail.label))?.value ?? null,
    impact,
    roles,
    categories,
    credentials: display.items.filter(item => ["credential", "publication"].includes(kind(item))).map(ref),
    notebookUrl: display.links.find(item => item.role === "ai-notebook")?.url ?? null,
    linkedInUrl: link(label => label === "linkedin")?.url ?? null,
    resumePath: display.assets.find(asset => asset.kind === "resume-pdf")?.outputPath ?? null,
    audioPath: display.assets.find(asset => asset.kind === "audio-overview")?.outputPath ?? null,
  };
}

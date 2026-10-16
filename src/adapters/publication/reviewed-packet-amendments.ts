import { createHash } from "node:crypto";

import type {
  CareerPortfolioDisplayItem as Item,
  ReviewedLocalPrototypePacket as Packet,
} from "../../domains/publication/domain/career-portfolio-display.js";
import type { PortfolioInclusionDecision as Decision } from "../../domains/publication/domain/career-portfolio-selection.js";

type Mutable<T> = { -readonly [K in keyof T]: T[K] extends readonly (infer U)[] ? U[] : T[K] };
type Asset = NonNullable<Packet["assets"]>[number];

/**
 * Person-approved changes to a reviewed packet, written by an interviewer or curator after review.
 * Every field states the desired end value, so applying the same file twice yields the same packet.
 */
export interface PacketAmendments {
  readonly schema: "why-hire-me.packet-amendments/v1";
  /** Identity of the packet these amendments produce. */
  readonly packetId: string;
  readonly reviewedBy: string;
  readonly reviewedAt: string;
  /** Short evidence label added once to the Evidence detail of every changed record. */
  readonly evidence: string;
  readonly updates?: readonly {
    readonly id: string; readonly name?: string; readonly summary?: string | null;
    readonly details?: Readonly<Record<string, string>>;
    readonly inclusion?: Omit<Decision, "recordId">;
  }[];
  /** New records, each linked to its engagement and, optionally, the record it reports on. */
  readonly additions?: readonly {
    readonly item: Omit<Item, "inclusion" | "recordedAt" | "details"> & { readonly details?: Item["details"] };
    readonly engagementId: string;
    readonly parentId?: string;
    readonly inclusion: Omit<Decision, "recordId">;
  }[];
  /** Technology categories for the Expertise lens; an identifier is derived from the name when omitted. */
  readonly categories?: readonly { readonly id?: string; readonly name: string; readonly summary?: string }[];
  /**
   * Technologies, each in exactly one category (identifier or exact name). `usedIn` record links are
   * additive; an identifier is derived from the name when omitted.
   */
  readonly technologies?: readonly {
    readonly id?: string; readonly name: string; readonly category: string;
    readonly summary?: string; readonly usedIn?: readonly string[];
  }[];
  /** Contextual technology uses, each visible in the record named by `workContextId`. */
  readonly technologyUses?: readonly {
    readonly id: string; readonly summary: string; readonly workContextId: string;
    /** Human-readable work context, such as the engagement or initiative name. */
    readonly workContext: string; readonly attribution?: string;
  }[];
  /** Assets keyed by output path; a source path is relative to the amended packet's directory. */
  readonly assets?: readonly Asset[];
  readonly limitations?: readonly string[];
}

const PARENT_PREDICATE = { summarised: "record.summarised_under", other: "outcome.reported_for" } as const;
const CATEGORY_SUMMARY = "Reviewed grouping for browsing technology use; not a proficiency rating or a separate career claim.";
const nameId = (prefix: string, name: string) => `${prefix}-${createHash("sha256").update(name).digest("hex").slice(0, 12)}`;

/** Applies amendments as a pure, idempotent function and carries renamed record names into derived text. */
export function applyPacketAmendments(source: Packet, amendments: PacketAmendments): Packet {
  if (amendments.schema !== "why-hire-me.packet-amendments/v1") throw new Error("Unsupported amendments schema.");
  const packet = structuredClone(source) as Mutable<Packet> & { assets?: Asset[] };
  const items = new Map(packet.items.map(item => [item.id, item as Mutable<Item>]));
  const date = amendments.reviewedAt.slice(0, 10);
  const review = packet.review.reviewReference;
  const renames: [string, string][] = [];

  const setDetail = (item: Mutable<Item>, label: string, value: string) => {
    const details = item.details as { label: string; value: string }[];
    const existing = details.find(detail => detail.label === label);
    if (existing) existing.value = value; else details.push({ label, value });
  };
  const noteEvidence = (item: Mutable<Item>) => {
    const evidence = item.details.find(detail => detail.label === "Evidence");
    if (!evidence) return setDetail(item, "Evidence", amendments.evidence);
    if (!evidence.value.split("; ").includes(amendments.evidence)) setDetail(item, "Evidence", `${evidence.value}; ${amendments.evidence}`);
  };
  const decide = (recordId: string, inclusion: Omit<Decision, "recordId">) => {
    const decision: Decision = { recordId, ...inclusion };
    packet.inclusionDecisions = [...packet.inclusionDecisions.filter(d => d.recordId !== recordId), decision];
    items.get(recordId)!.inclusion = decision;
  };
  const relate = (id: string, subject: string, object: string, predicate: string) => {
    if (!packet.relations.some(relation => relation.id === id))
      packet.relations.push({ id, subject, object, predicate, reviewed: true, reviewReference: review });
  };

  for (const update of amendments.updates ?? []) {
    const item = items.get(update.id);
    if (!item) throw new Error(`Amendment updates unknown record ${update.id}.`);
    const before = JSON.stringify(item);
    if (update.name !== undefined && update.name !== item.name) { renames.push([item.name, update.name]); item.name = update.name; }
    if (update.summary !== undefined) item.summary = update.summary;
    for (const [label, value] of Object.entries(update.details ?? {})) setDetail(item, label, value);
    if (update.inclusion) decide(item.id, update.inclusion);
    if (JSON.stringify(item) !== before) { item.recordedAt = date; noteEvidence(item); }
  }

  for (const addition of amendments.additions ?? []) {
    const { item: added, engagementId, parentId, inclusion } = addition;
    for (const id of [engagementId, parentId].filter((id): id is string => id !== undefined))
      if (!items.has(id) && id !== added.id) throw new Error(`Addition ${added.id} links to unknown record ${id}.`);
    const item: Mutable<Item> = { details: [], ...structuredClone(added), recordedAt: date, inclusion: null } as Mutable<Item>;
    if (!items.has(item.id)) packet.items.push(item);
    else Object.assign(items.get(item.id)!, item);
    items.set(item.id, items.get(item.id) ?? item);
    noteEvidence(items.get(item.id)!);
    decide(item.id, inclusion);
    relate(`REL-${engagementId}-${item.id}`, engagementId, item.id, "engagement.includes_record");
    if (parentId) relate(`REL-PARENT-${item.id}`, item.id, parentId,
      inclusion.status === "summarised" ? PARENT_PREDICATE.summarised : PARENT_PREDICATE.other);
  }

  const touched = new Set<string>();
  const upsert = (id: string, type: string, name: string, summary: string | null | undefined) => {
    const existing = items.get(id);
    if (existing && existing.type !== type) throw new Error(`Amendment ${id} is a ${existing.type}, not a ${type}.`);
    const item = existing ?? ({ id, type, name, summary: null, recordedAt: date, details: [], inclusion: null } as Mutable<Item>);
    if (!existing) { packet.items.push(item); items.set(id, item); }
    const before = JSON.stringify(item);
    if (existing && existing.name !== name) renames.push([existing.name, name]);
    item.name = name;
    if (summary !== undefined) item.summary = summary;
    if (!existing || JSON.stringify(item) !== before) { item.recordedAt = date; noteEvidence(item); touched.add(id); }
    return item;
  };
  const ofType = (type: string) => [...items.values()].filter(item => item.type === type);
  const resolve = (type: string, prefix: string, entry: { id?: string; name: string }) => {
    const sameCase = ofType(type).find(item => item.name === entry.name);
    const otherCase = ofType(type).find(item => item.name !== entry.name && item.name.toLowerCase() === entry.name.toLowerCase());
    const id = entry.id ?? sameCase?.id ?? nameId(prefix, entry.name);
    if (otherCase && otherCase.id !== id)
      throw new Error(`Amendment adds ${type} "${entry.name}" but ${otherCase.id} is already "${otherCase.name}".`);
    return id;
  };

  for (const category of amendments.categories ?? [])
    upsert(resolve("TechnologyCategory", "CAT", category), "TechnologyCategory", category.name, category.summary ?? CATEGORY_SUMMARY);

  for (const technology of amendments.technologies ?? []) {
    const category = items.get(technology.category)?.type === "TechnologyCategory" ? items.get(technology.category)
      : ofType("TechnologyCategory").find(item => item.name === technology.category);
    if (!category) throw new Error(`Technology ${technology.name} names unknown category ${technology.category}.`);
    for (const recordId of technology.usedIn ?? [])
      if (!items.has(recordId)) throw new Error(`Technology ${technology.name} links to unknown record ${recordId}.`);
    const item = upsert(resolve("Technology", "TECH", technology), "Technology", technology.name, technology.summary);
    // A technology belongs to exactly one category: the renderer reads the first such relation.
    const previous = packet.relations.filter(r => r.subject === item.id && r.predicate === "technology.belongs_to_category");
    if (previous.some(r => r.object !== category.id) || previous.length === 0) {
      previous.forEach(r => touched.add(r.object));
      packet.relations = packet.relations.filter(r => !previous.includes(r));
      relate(`REL-CATEGORY-${category.name}-${item.name}`, item.id, category.id, "technology.belongs_to_category");
      touched.add(category.id).add(item.id);
    }
    for (const recordId of technology.usedIn ?? []) {
      if (packet.relations.some(r => r.subject === recordId && r.object === item.id && r.predicate === "record.has_contextual_technology")) continue;
      relate(`REL-TECH-${recordId}-${item.name}`, recordId, item.id, "record.has_contextual_technology");
      touched.add(recordId).add(item.id);
    }
  }

  for (const use of amendments.technologyUses ?? []) {
    if (!items.has(use.workContextId)) throw new Error(`Technology use ${use.id} names unknown work context ${use.workContextId}.`);
    const item = upsert(use.id, "TechnologyUse", `Technology use ${use.id}`, use.summary);
    const before = JSON.stringify(item);
    setDetail(item, "Work context", use.workContext);
    setDetail(item, "Attribution", use.attribution ?? "Person-approved amendment");
    if (JSON.stringify(item) !== before) { item.recordedAt = date; noteEvidence(item); touched.add(use.id); }
    packet.relations = packet.relations.filter(r => !(r.subject === use.id && r.predicate === "technology_use.in_context" && r.object !== use.workContextId));
    relate(`REVIEWED-TU-${use.id}`, use.id, use.workContextId, "technology_use.in_context");
    packet.technologyUseMap = [...packet.technologyUseMap.filter(entry => entry.technologyUseId !== use.id),
      { technologyUseId: use.id, workContextId: use.workContextId, status: "visible-in-context", targetRecordId: use.workContextId }];
  }

  // Organisation and technology readouts repeat record names; keep them in step with a rename.
  for (const [before, after] of renames) for (const item of items.values()) {
    if (item.summary?.includes(before)) item.summary = item.summary.split(before).join(after);
    for (const detail of item.details as { label: string; value: string }[])
      if (detail.value.includes(before)) detail.value = detail.value.split(before).join(after);
  }

  // Technology readouts follow the relations. Links are additive, so linked work and contextual
  // technologies gain missing names; a category is recomputed because a technology can move out of it.
  const linked = (predicate: string, end: "subject" | "object", id: string) => packet.relations
    .filter(r => r.predicate === predicate && r[end === "subject" ? "object" : "subject"] === id)
    .map(r => items.get(r[end])?.name).filter((name): name is string => name !== undefined);
  const extend = (item: Mutable<Item>, label: string, separator: string, names: string[]) => {
    const current = item.details.find(detail => detail.label === label)?.value.split(separator).filter(Boolean) ?? [];
    const next = [...current, ...names.filter(name => !current.includes(name))];
    if (next.length > current.length) setDetail(item, label, next.join(separator));
  };
  for (const id of touched) {
    const item = items.get(id)!;
    if (item.type === "TechnologyCategory") {
      const names = linked("technology.belongs_to_category", "subject", id);
      if (names.length) setDetail(item, "Technologies", names.join(" · "));
    } else if (item.type === "Technology") extend(item, "Linked work", "; ", linked("record.has_contextual_technology", "subject", id));
    else if (item.type !== "TechnologyUse") extend(item, "Contextual technologies", " · ", linked("record.has_contextual_technology", "object", id));
  }

  for (const asset of amendments.assets ?? [])
    packet.assets = [...(packet.assets ?? []).filter(existing => existing.outputPath !== asset.outputPath), asset];
  for (const limitation of amendments.limitations ?? [])
    if (!packet.limitations.includes(limitation)) packet.limitations.push(limitation);

  const changed = new Set([...(amendments.updates ?? []).map(update => update.id), ...touched]);
  for (const entry of packet.carryForwardMap as Mutable<Packet["carryForwardMap"][number]>[])
    if (entry.disposition === "preserved" && changed.has(entry.baselineItemId.replace(/^item:/, "")))
      Object.assign(entry, { disposition: "reworded", personApproved: true });

  packet.packetId = amendments.packetId;
  packet.review = { ...packet.review, reviewedBy: amendments.reviewedBy, reviewedAt: amendments.reviewedAt };
  return packet as Packet;
}

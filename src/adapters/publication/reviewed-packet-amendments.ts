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
  /** Assets keyed by output path; a source path is relative to the amended packet's directory. */
  readonly assets?: readonly Asset[];
  readonly limitations?: readonly string[];
}

const PARENT_PREDICATE = { summarised: "record.summarised_under", other: "outcome.reported_for" } as const;

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

  // Organisation and technology readouts repeat record names; keep them in step with a rename.
  for (const [before, after] of renames) for (const item of items.values()) {
    if (item.summary?.includes(before)) item.summary = item.summary.split(before).join(after);
    for (const detail of item.details as { label: string; value: string }[])
      if (detail.value.includes(before)) detail.value = detail.value.split(before).join(after);
  }

  for (const asset of amendments.assets ?? [])
    packet.assets = [...(packet.assets ?? []).filter(existing => existing.outputPath !== asset.outputPath), asset];
  for (const limitation of amendments.limitations ?? [])
    if (!packet.limitations.includes(limitation)) packet.limitations.push(limitation);

  const changed = new Set([...(amendments.updates ?? []).map(update => update.id)]);
  for (const entry of packet.carryForwardMap as Mutable<Packet["carryForwardMap"][number]>[])
    if (entry.disposition === "preserved" && changed.has(entry.baselineItemId.replace(/^item:/, "")))
      Object.assign(entry, { disposition: "reworded", personApproved: true });

  packet.packetId = amendments.packetId;
  packet.review = { ...packet.review, reviewedBy: amendments.reviewedBy, reviewedAt: amendments.reviewedAt };
  return packet as Packet;
}

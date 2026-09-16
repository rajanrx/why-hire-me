import type { CareerPortfolioDisplayModel, ReviewedLocalPrototypePacket } from "../../domains/publication/domain/career-portfolio-display.js";
import { reconcilePortfolioInclusion, type PortfolioAchievement } from "../../domains/publication/domain/career-portfolio-selection.js";
import { CareerPortfolioValidationError, resumeLengths } from "../../domains/publication/domain/career-portfolio.js";

function fail(message: string): never { throw new CareerPortfolioValidationError(`Reviewed prototype packet: ${message}`); }
function nonempty(value: unknown): value is string { return typeof value === "string" && value.trim().length > 0; }

/** A bounded, person-reviewed packet becomes display data, never a forged release. */
export function adaptReviewedPrototype(packet: ReviewedLocalPrototypePacket): CareerPortfolioDisplayModel {
  if (packet?.schema !== "why-hire-me.reviewed-prototype-packet/v1" ||
    !nonempty(packet.packetId) || !nonempty(packet.subjectDisplayName) ||
    !nonempty(packet.purpose) || !["private", "restricted", "public"].includes(packet.audience) ||
    !resumeLengths.includes(packet.resumeLength) || !nonempty(packet.review?.reviewedBy) ||
    !nonempty(packet.review?.reviewReference) || !Number.isFinite(Date.parse(packet.review?.reviewedAt ?? "")) ||
    !Array.isArray(packet.review?.disclosureChoices) || !Array.isArray(packet.items) ||
    !Array.isArray(packet.relations) || !Array.isArray(packet.links) ||
    !Array.isArray(packet.inclusionDecisions) || !Array.isArray(packet.technologyUseMap) ||
    !Array.isArray(packet.referenceLinkMap) || !Array.isArray(packet.carryForwardMap) ||
    !Array.isArray(packet.limitations))
    fail("schema, authority, review, or required inventory is missing.");

  const omitted = new Set(packet.review.disclosureChoices
    .filter(choice => choice.status === "omitted").map(choice => choice.field.toLowerCase()));
  const ids = new Set<string>();
  for (const item of packet.items) {
    if (!nonempty(item.id) || ids.has(item.id) || !nonempty(item.type) || !nonempty(item.name) ||
      (item.summary !== null && typeof item.summary !== "string") ||
      !Array.isArray(item.details) || item.details.some((detail: { label: unknown; value: unknown }) =>
        !nonempty(detail.label) || typeof detail.value !== "string"))
      fail(`invalid or duplicate display item ${String(item?.id)}.`);
    for (const detail of item.details) if (omitted.has(detail.label.toLowerCase()))
      fail(`omitted disclosure field ${detail.label} remains in ${item.id}.`);
    ids.add(item.id);
  }
  if (!packet.review.disclosureChoices.every(choice => nonempty(choice.field) &&
    ["approved-for-audience", "omitted"].includes(choice.status))) fail("invalid disclosure choice.");

  const achievements: PortfolioAchievement[] = packet.items.flatMap(item => {
    const kind = item.type.toLowerCase() === "reported outcome" ? "reported-outcome" :
      item.type === "Work" || item.type === "Contribution" ? item.type : null;
    return kind ? [{ recordId: item.id, kind, label: item.name }] : [];
  });
  const inclusion = reconcilePortfolioInclusion(achievements, packet.inclusionDecisions);
  if (!inclusion.complete) fail(`inclusion map is incomplete: ${[...inclusion.errors,
    ...inclusion.unresolvedRecordIds].join("; ")}`);
  const decisions = new Map(inclusion.decisions.map(decision => [decision.recordId, decision]));
  for (const item of packet.items) {
    const decision = decisions.get(item.id) ?? null;
    if (JSON.stringify(item.inclusion) !== JSON.stringify(decision))
      fail(`item ${item.id} disagrees with its reviewed inclusion decision.`);
  }

  const relationIds = new Set<string>();
  for (const relation of packet.relations) {
    if (relation.reviewed !== true || !nonempty(relation.reviewReference) || !nonempty(relation.id) ||
      relationIds.has(relation.id) || !ids.has(relation.subject) || !ids.has(relation.object) ||
      !nonempty(relation.predicate) || relation.subject === relation.object)
      fail(`unreviewed, invalid, or dangling relationship ${String(relation?.id)}.`);
    relationIds.add(relation.id);
  }
  const linkIds = new Set<string>();
  for (const link of packet.links) {
    if (link.reviewed !== true || !nonempty(link.reviewReference) || !nonempty(link.id) ||
      linkIds.has(link.id) || !nonempty(link.label) ||
      (link.targetRecordId !== null && !ids.has(link.targetRecordId)) ||
      !["supplied-unvisited", "separately-reviewed"].includes(link.sourceStatus))
      fail(`unreviewed or dangling link ${String(link?.id)}.`);
    let url: URL;
    try { url = new URL(link.url); } catch { fail(`unsafe link ${link.id}.`); }
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password)
      fail(`unsafe link ${link.id}.`);
    linkIds.add(link.id);
  }
  for (const asset of packet.assets ?? []) {
    if (asset.reviewed !== true || !nonempty(asset.reviewReference) || !nonempty(asset.sourcePath) ||
      !/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(pdf|svg|png|jpg)$/.test(asset.outputPath))
      fail(`unreviewed or unsafe asset ${String(asset?.outputPath)}.`);
  }
  const technologies = packet.items.filter(item => item.type === "TechnologyUse");
  const tuIds = new Set(technologies.map(item => item.id));
  const mappedTuIds = new Set(packet.technologyUseMap.map(item => item.technologyUseId));
  if (mappedTuIds.size !== packet.technologyUseMap.length || mappedTuIds.size !== tuIds.size ||
    [...tuIds].some(id => !mappedTuIds.has(id)) || packet.technologyUseMap.some(item =>
      (item.workContextId !== "career-wide" && !ids.has(item.workContextId)) ||
      item.status === "deferred" || item.status === "excluded"))
    fail("technology-use map is incomplete or contains unresolved work context.");
  const mappedLinkIds = new Set(packet.referenceLinkMap.map(item => item.linkId));
  if (mappedLinkIds.size !== packet.referenceLinkMap.length || mappedLinkIds.size !== linkIds.size ||
    [...linkIds].some(id => !mappedLinkIds.has(id)) || packet.referenceLinkMap.some(item =>
      item.status === "deferred" || item.status === "excluded"))
    fail("reference-link map is incomplete.");
  if (packet.carryForwardMap.some(item => !nonempty(item.baselineItemId) ||
    (item.disposition !== "excluded" && !nonempty(item.newLocator)) || !item.personApproved ||
    item.disposition === "unresolved" ||
    (item.disposition === "excluded" && !["redaction", "contact"].includes(item.itemType))) ||
    new Set(packet.carryForwardMap.map(item => item.baselineItemId)).size !== packet.carryForwardMap.length)
    fail("carry-forward map has an unresolved, unapproved, or duplicate baseline item.");

  return Object.freeze({ schema: "why-hire-me.portfolio-display/v1",
    subjectDisplayName: packet.subjectDisplayName, purpose: packet.purpose,
    audience: packet.audience, resumeLength: packet.resumeLength,
    items: Object.freeze([...packet.items]),
    relations: Object.freeze(packet.relations.map(({ id, subject, object, predicate }) =>
      Object.freeze({ id, subject, object, predicate }))),
    links: Object.freeze(packet.links.map(({ id, targetRecordId, label, url, sourceStatus }) =>
      Object.freeze({ id, targetRecordId, label, url, sourceStatus }))),
    assets: Object.freeze((packet.assets ?? []).map(asset => Object.freeze({
      outputPath: asset.outputPath,
      kind: asset.outputPath.endsWith(".pdf") ? "resume-pdf" as const : "other" as const,
    }))),
    limitations: Object.freeze([...packet.limitations]),
    provenance: Object.freeze({ mode: "local-prototype", packetId: packet.packetId,
      reviewedBy: packet.review.reviewedBy, reviewReference: packet.review.reviewReference,
      validation: "partially-validated", status: "session-only", generatedAt: packet.review.reviewedAt }),
  });
}

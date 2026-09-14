import type { ReleaseInputRecord } from "./knowledge-release.js";

export const portfolioInclusionStatuses = ["featured", "supporting", "summarised", "excluded", "deferred"] as const;
export type PortfolioInclusionStatus = (typeof portfolioInclusionStatuses)[number];

export interface PortfolioAchievement {
  readonly recordId: string;
  readonly kind: "Work" | "Contribution" | "reported-outcome";
  readonly label: string;
}

export interface PortfolioInclusionDecision {
  readonly recordId: string;
  readonly status: PortfolioInclusionStatus;
  readonly rationale: string;
  readonly summarisedUnderRecordId: string | null;
}

export interface PortfolioInclusionReconciliation {
  readonly complete: boolean;
  readonly decisions: readonly PortfolioInclusionDecision[];
  readonly counts: Readonly<Record<PortfolioInclusionStatus, number>>;
  readonly unresolvedRecordIds: readonly string[];
  readonly errors: readonly string[];
}

function object(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function label(record: ReleaseInputRecord): string {
  const data = object(record.data); const attributes = object(data.attributes);
  const literal = object(data.object);
  const found = [attributes.displayName, data.statement, literal.value]
    .find((value) => typeof value === "string" && value.trim());
  return typeof found === "string" ? found.trim() : record.id;
}

export function authorisedPortfolioAchievements(records: readonly ReleaseInputRecord[]): readonly PortfolioAchievement[] {
  const achievements: PortfolioAchievement[] = [];
  for (const record of records) {
    const data = object(record.data);
    if (record.recordType === "Entity" && (data.entityType === "Work" || data.entityType === "Contribution")) {
      achievements.push(Object.freeze({ recordId: record.id, kind: data.entityType, label: label(record) }));
    }
    if (record.recordType === "Claim" && data.claimType === "reported-outcome") {
      achievements.push(Object.freeze({ recordId: record.id, kind: "reported-outcome", label: label(record) }));
    }
  }
  return Object.freeze(achievements.sort((a, b) => a.recordId.localeCompare(b.recordId)));
}

export function reconcilePortfolioInclusion(
  achievements: readonly PortfolioAchievement[], decisions: readonly PortfolioInclusionDecision[],
): PortfolioInclusionReconciliation {
  const errors: string[] = [];
  const unresolved = new Set(achievements.map((achievement) => achievement.recordId));
  const eligible = new Set(unresolved);
  const byRecord = new Map<string, PortfolioInclusionDecision>();

  for (const decision of decisions) {
    if (!eligible.has(decision.recordId)) { errors.push(`Inclusion decision references unknown achievement ${decision.recordId}.`); continue; }
    if (byRecord.has(decision.recordId)) { errors.push(`Achievement ${decision.recordId} has more than one inclusion decision.`); continue; }
    byRecord.set(decision.recordId, decision);
    if (!portfolioInclusionStatuses.includes(decision.status) || !decision.rationale.trim()) {
      errors.push(`Achievement ${decision.recordId} has an invalid status or missing rationale.`); continue;
    }
    if (decision.status === "summarised") {
      if (decision.summarisedUnderRecordId === null || decision.summarisedUnderRecordId === decision.recordId ||
        !eligible.has(decision.summarisedUnderRecordId)) {
        errors.push(`Achievement ${decision.recordId} has an invalid summarisation target.`); continue;
      }
    } else if (decision.summarisedUnderRecordId !== null) {
      errors.push(`Achievement ${decision.recordId} has a summarisation target but is not summarised.`); continue;
    }
    if (decision.status === "deferred") continue;
    unresolved.delete(decision.recordId);
  }

  const counts = Object.fromEntries(portfolioInclusionStatuses.map((status) =>
    [status, [...byRecord.values()].filter((decision) => decision.status === status).length])) as Record<PortfolioInclusionStatus, number>;
  for (const decision of byRecord.values()) if (decision.status === "summarised") {
    const target = byRecord.get(decision.summarisedUnderRecordId!);
    if (target === undefined || !["featured", "supporting"].includes(target.status)) {
      errors.push(`Achievement ${decision.recordId} is summarised under an item that is not featured or supporting.`);
      unresolved.add(decision.recordId);
    }
  }
  return Object.freeze({ complete: errors.length === 0 && unresolved.size === 0,
    decisions: Object.freeze([...byRecord.values()].sort((a, b) => a.recordId.localeCompare(b.recordId))),
    counts: Object.freeze(counts), unresolvedRecordIds: Object.freeze([...unresolved].sort()), errors: Object.freeze(errors) });
}

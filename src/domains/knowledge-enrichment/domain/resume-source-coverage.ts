export const resumeSourceUnitKinds = [
  "employment-bullet",
  "project",
  "contribution",
  "reported-outcome",
  "artefact",
  "credential",
  "publication",
  "technology-use",
] as const;

export type ResumeSourceUnitKind = (typeof resumeSourceUnitKinds)[number];

export interface ResumeSourceUnit {
  readonly id: string;
  readonly locator: string;
  readonly kind: ResumeSourceUnitKind;
  readonly faithfulMeaning: string;
  readonly engagementId: string | null;
  readonly roleId: string | null;
  readonly parentSourceUnitId: string | null;
}

export type ResumeSourceDisposition =
  | { readonly sourceUnitId: string; readonly kind: "proposed-entity" | "proposed-claim"; readonly proposalIds: readonly string[] }
  | { readonly sourceUnitId: string; readonly kind: "ambiguity"; readonly ambiguityId: string; readonly rationale: string }
  | { readonly sourceUnitId: string; readonly kind: "duplicate"; readonly mergedIntoSourceUnitId: string; readonly rationale: string }
  | { readonly sourceUnitId: string; readonly kind: "excluded" | "non-career-content"; readonly rationale: string }
  | { readonly sourceUnitId: string; readonly kind: "split"; readonly splitIntoSourceUnitIds: readonly string[]; readonly rationale: string };

export interface ResumeCoverageReconciliation {
  readonly complete: boolean;
  readonly counts: {
    readonly total: number;
    readonly captured: number;
    readonly merged: number;
    readonly excluded: number;
    readonly ambiguous: number;
    readonly split: number;
    readonly unresolved: number;
  };
  readonly unresolvedSourceUnitIds: readonly string[];
  readonly errors: readonly string[];
}

function nonBlank(value: string): boolean { return value.trim().length > 0; }

export function reconcileResumeSourceCoverage(
  sourceUnits: readonly ResumeSourceUnit[],
  dispositions: readonly ResumeSourceDisposition[],
): ResumeCoverageReconciliation {
  const errors: string[] = [];
  const unresolved = new Set<string>();
  const units = new Map<string, ResumeSourceUnit>();
  const dispositionByUnit = new Map<string, ResumeSourceDisposition>();

  for (const unit of sourceUnits) {
    if (!nonBlank(unit.id) || units.has(unit.id)) {
      errors.push(`Source unit ID is blank or duplicated: ${unit.id || "<blank>"}.`);
      if (nonBlank(unit.id)) unresolved.add(unit.id);
      continue;
    }
    units.set(unit.id, unit);
    if (!nonBlank(unit.locator) || !nonBlank(unit.faithfulMeaning) || !resumeSourceUnitKinds.includes(unit.kind)) {
      errors.push(`Source unit ${unit.id} has an invalid locator, meaning, or kind.`);
      unresolved.add(unit.id);
    }
  }

  for (const disposition of dispositions) {
    if (!units.has(disposition.sourceUnitId)) {
      errors.push(`Disposition references unknown source unit ${disposition.sourceUnitId}.`);
      continue;
    }
    if (dispositionByUnit.has(disposition.sourceUnitId)) {
      errors.push(`Source unit ${disposition.sourceUnitId} has more than one disposition.`);
      unresolved.add(disposition.sourceUnitId);
      continue;
    }
    dispositionByUnit.set(disposition.sourceUnitId, disposition);
  }

  for (const [id, unit] of units) {
    const disposition = dispositionByUnit.get(id);
    if (disposition === undefined) { unresolved.add(id); continue; }
    if ((disposition.kind === "proposed-entity" || disposition.kind === "proposed-claim") &&
      (disposition.proposalIds.length === 0 || disposition.proposalIds.some((proposalId) => !nonBlank(proposalId)))) {
      errors.push(`Source unit ${id} has no valid proposal reference.`); unresolved.add(id);
    }
    if (["ambiguity", "duplicate", "excluded", "non-career-content", "split"].includes(disposition.kind) &&
      !("rationale" in disposition && nonBlank(disposition.rationale))) {
      errors.push(`Source unit ${id} requires a rationale for ${disposition.kind}.`); unresolved.add(id);
    }
    if (disposition.kind === "duplicate" && (!units.has(disposition.mergedIntoSourceUnitId) || disposition.mergedIntoSourceUnitId === id)) {
      errors.push(`Source unit ${id} has an invalid merge target.`); unresolved.add(id);
    }
    if (disposition.kind === "split") {
      if (disposition.splitIntoSourceUnitIds.length < 2) {
        errors.push(`Source unit ${id} must split into at least two units.`); unresolved.add(id);
      }
      for (const childId of disposition.splitIntoSourceUnitIds) {
        const child = units.get(childId);
        if (child === undefined || child.parentSourceUnitId !== id) {
          errors.push(`Split child ${childId} is missing or does not reference parent ${id}.`); unresolved.add(id);
        } else if (!dispositionByUnit.has(childId)) unresolved.add(childId);
      }
    }
    if (unit.parentSourceUnitId !== null && !units.has(unit.parentSourceUnitId)) {
      errors.push(`Source unit ${id} references unknown parent ${unit.parentSourceUnitId}.`); unresolved.add(id);
    }
  }

  const values = [...dispositionByUnit.values()].filter((item) => !unresolved.has(item.sourceUnitId));
  const count = (...kinds: ResumeSourceDisposition["kind"][]) => values.filter((item) => kinds.includes(item.kind)).length;
  return Object.freeze({
    complete: unresolved.size === 0 && errors.length === 0,
    counts: Object.freeze({ total: sourceUnits.length, captured: count("proposed-entity", "proposed-claim"),
      merged: count("duplicate"), excluded: count("excluded", "non-career-content"),
      ambiguous: count("ambiguity"), split: count("split"), unresolved: unresolved.size }),
    unresolvedSourceUnitIds: Object.freeze([...unresolved].sort()), errors: Object.freeze(errors),
  });
}

export interface PrototypeCarryForwardLocator {
  readonly baselineItemId: string;
  readonly disposition: string;
  readonly newLocator: string | null;
}

/** A carry-forward claim must resolve to a file the candidate will actually contain. */
export function invalidCarryForwardLocators(
  entries: readonly PrototypeCarryForwardLocator[],
  outputPaths: ReadonlySet<string>,
): readonly PrototypeCarryForwardLocator[] {
  return entries.filter((entry) => entry.disposition !== "excluded").filter((entry) => {
    const raw = entry.newLocator ?? "";
    const path = (raw.split("#", 1)[0] ?? "").replace(/^\.\//, "");
    return !path || path.startsWith("/") || path.split("/").includes("..") || !outputPaths.has(path);
  });
}

import type { PortfolioInclusionDecision } from "./career-portfolio-selection.js";
import type { ResumeLength } from "./career-portfolio.js";

/** Public presentation data only. This is not a knowledge release or evidence store. */
export interface CareerPortfolioDisplayItem {
  readonly id: string;
  readonly type: string;
  readonly name: string;
  readonly summary: string | null;
  readonly recordedAt: string;
  readonly details: readonly { readonly label: string; readonly value: string }[];
  readonly inclusion: PortfolioInclusionDecision | null;
}

export interface CareerPortfolioDisplayRelation {
  readonly id: string;
  readonly subject: string;
  readonly object: string;
  readonly predicate: string;
}

export interface CareerPortfolioDisplayLink {
  readonly id: string;
  readonly targetRecordId: string | null;
  readonly label: string;
  readonly url: string;
  readonly sourceStatus: "supplied-unvisited" | "separately-reviewed";
}

export interface CareerPortfolioDisplayModel {
  readonly schema: "why-hire-me.portfolio-display/v1";
  readonly subjectDisplayName: string;
  readonly purpose: string;
  readonly audience: "private" | "restricted" | "public";
  readonly resumeLength: ResumeLength;
  readonly items: readonly CareerPortfolioDisplayItem[];
  readonly relations: readonly CareerPortfolioDisplayRelation[];
  readonly links: readonly CareerPortfolioDisplayLink[];
  readonly assets: readonly { readonly outputPath: string; readonly kind: "resume-pdf" | "other" }[];
  readonly limitations: readonly string[];
  readonly provenance:
    | { readonly mode: "governed-render"; readonly releaseId: string; readonly releaseDigest: string;
        readonly createdAt: string; readonly authorisationExpiresAt: string }
    | { readonly mode: "local-prototype"; readonly packetId: string; readonly reviewedBy: string;
        readonly reviewReference: string; readonly validation: "partially-validated";
        readonly status: "session-only"; readonly generatedAt: string };
}

export interface ReviewedLocalPrototypePacket {
  readonly schema: "why-hire-me.reviewed-prototype-packet/v1";
  readonly packetId: string;
  readonly subjectDisplayName: string;
  readonly purpose: string;
  readonly audience: "private" | "restricted" | "public";
  readonly resumeLength: ResumeLength;
  readonly review: { readonly reviewedBy: string; readonly reviewReference: string;
    readonly reviewedAt: string; readonly disclosureChoices: readonly {
      readonly field: string; readonly status: "approved-for-audience" | "omitted";
    }[] };
  readonly items: readonly CareerPortfolioDisplayItem[];
  /** Each relation is independently reviewed. Never infer graph edges from shared tags or prose. */
  readonly relations: readonly (CareerPortfolioDisplayRelation & {
    readonly reviewed: true; readonly reviewReference: string;
  })[];
  readonly links: readonly (CareerPortfolioDisplayLink & {
    readonly reviewed: true; readonly reviewReference: string;
  })[];
  readonly inclusionDecisions: readonly PortfolioInclusionDecision[];
  readonly technologyUseMap: readonly { readonly technologyUseId: string;
    readonly workContextId: string; readonly status: string; readonly targetRecordId: string | null }[];
  readonly referenceLinkMap: readonly { readonly linkId: string; readonly status: string;
    readonly targetRecordId: string | null }[];
  readonly carryForwardMap: readonly { readonly baselineItemId: string; readonly itemType: string;
    readonly disposition: string; readonly newLocator: string | null; readonly personApproved: boolean }[];
  readonly limitations: readonly string[];
  readonly assets?: readonly { readonly sourcePath: string; readonly outputPath: string;
    readonly reviewed: true; readonly reviewReference: string }[];
}

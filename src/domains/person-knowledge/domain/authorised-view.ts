import type { AdmissionActivity, CanonicalEntity } from "./entity-admission.js";

export type DisclosureAudience = "private" | "restricted" | "public";
export type AuthorisedViewRecord = CanonicalEntity | AdmissionActivity;

export interface DisclosureGrant {
  readonly schemaVersion: "0.1";
  readonly id: string;
  readonly knowledgeSpaceId: string;
  readonly purpose: string;
  readonly audience: DisclosureAudience;
  readonly audienceDescription: string;
  readonly allowedPolicyLabels: readonly string[];
  readonly issuedBy: string;
  readonly issuedAt: string;
  readonly expiresAt: string;
  readonly status: "active";
}

export interface AuthorisedKnowledgeView {
  readonly schemaVersion: "0.1";
  readonly id: string;
  readonly knowledgeSpaceId: string;
  readonly subject: { readonly displayName: string };
  readonly version: number;
  readonly grant: DisclosureGrant;
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly records: readonly AuthorisedViewRecord[];
  readonly excluded: {
    readonly entities: number;
    readonly activities: number;
  };
  readonly limitations: readonly string[];
  readonly idempotencyKey: string;
  readonly requestFingerprint: string;
}

export class AuthorisedViewValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "AuthorisedViewValidationError";
  }
}

export class AuthorisedViewConflictError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "AuthorisedViewConflictError";
  }
}

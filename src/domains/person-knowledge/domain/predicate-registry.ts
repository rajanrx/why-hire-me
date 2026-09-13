export const predicateRegistryVersion = "0.1.0" as const;

export type KnowledgeEntityType =
  | "Person"
  | "Organisation"
  | "Engagement"
  | "Role"
  | "Work"
  | "Contribution"
  | "Artefact"
  | "Technology"
  | "TechnologyUse"
  | "Credential";

export interface PredicateDefinition {
  readonly id: string;
  readonly label: string;
  readonly definition: string;
  readonly subjectTypes: readonly KnowledgeEntityType[];
  readonly objectTypes: readonly KnowledgeEntityType[];
  readonly status: "active" | "deprecated";
  readonly introducedIn: typeof predicateRegistryVersion;
}

function predicate(
  id: string,
  label: string,
  definition: string,
  subject: KnowledgeEntityType,
  object: KnowledgeEntityType,
): PredicateDefinition {
  return Object.freeze({
    id,
    label,
    definition,
    subjectTypes: Object.freeze([subject]),
    objectTypes: Object.freeze([object]),
    status: "active",
    introducedIn: predicateRegistryVersion,
  });
}

export const predicateRegistry: readonly PredicateDefinition[] = Object.freeze([
  predicate(
    "person.has_engagement",
    "has engagement",
    "The person participates in the engagement.",
    "Person",
    "Engagement",
  ),
  predicate(
    "engagement.with_organisation",
    "with organisation",
    "The engagement is with the organisation.",
    "Engagement",
    "Organisation",
  ),
  predicate(
    "engagement.has_role",
    "has role",
    "The role is held within the engagement.",
    "Engagement",
    "Role",
  ),
  predicate(
    "engagement.includes_work",
    "includes work",
    "The work occurred within the engagement.",
    "Engagement",
    "Work",
  ),
  predicate(
    "person.made_contribution",
    "made contribution",
    "The contribution is attributable to the person.",
    "Person",
    "Contribution",
  ),
  predicate(
    "contribution.to_work",
    "to work",
    "The contribution applies to the work.",
    "Contribution",
    "Work",
  ),
  predicate(
    "contribution.produced_artefact",
    "produced artefact",
    "The contribution produced the artefact.",
    "Contribution",
    "Artefact",
  ),
  predicate(
    "work.has_technology_use",
    "has technology use",
    "The technology use occurred in the work context.",
    "Work",
    "TechnologyUse",
  ),
  predicate(
    "technology_use.uses_technology",
    "uses technology",
    "The contextual use applies to the technology.",
    "TechnologyUse",
    "Technology",
  ),
  predicate(
    "credential.issued_by",
    "issued by",
    "The organisation issued the credential.",
    "Credential",
    "Organisation",
  ),
  predicate(
    "credential.issued_to",
    "issued to",
    "The credential was issued to the person.",
    "Credential",
    "Person",
  ),
]);

export class PredicateValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "PredicateValidationError";
  }
}

export function getPredicate(id: string): PredicateDefinition {
  const found = predicateRegistry.find((entry) => entry.id === id);
  if (found === undefined) {
    throw new PredicateValidationError(`Unknown predicate: ${id}`);
  }
  return found;
}

export function validatePredicateUse(
  id: string,
  subject: KnowledgeEntityType,
  object: KnowledgeEntityType,
): PredicateDefinition {
  const found = getPredicate(id);
  if (found.status !== "active") {
    throw new PredicateValidationError(`Predicate is not active: ${id}`);
  }
  if (!found.subjectTypes.includes(subject) || !found.objectTypes.includes(object)) {
    throw new PredicateValidationError(
      `Predicate ${id} does not allow ${subject} -> ${object}.`,
    );
  }
  return found;
}

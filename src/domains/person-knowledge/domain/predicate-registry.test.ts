import assert from "node:assert/strict";
import test from "node:test";
import {
  getPredicate,
  predicateRegistry,
  predicateRegistryVersion,
  validatePredicateUse,
} from "./predicate-registry.js";

test("registry 0.2.0 exactly matches the governed predicate and type pairs", () => {
  assert.equal(predicateRegistryVersion, "0.2.0");
  assert.deepEqual(
    predicateRegistry.map((entry) => [entry.id, entry.subjectTypes[0], entry.objectTypes[0]]),
    [
      ["person.has_engagement", "Person", "Engagement"],
      ["engagement.with_organisation", "Engagement", "Organisation"],
      ["engagement.has_role", "Engagement", "Role"],
      ["engagement.includes_work", "Engagement", "Work"],
      ["person.made_contribution", "Person", "Contribution"],
      ["contribution.to_work", "Contribution", "Work"],
      ["contribution.produced_artefact", "Contribution", "Artefact"],
      ["work.has_technology_use", "Work", "TechnologyUse"],
      ["technology_use.uses_technology", "TechnologyUse", "Technology"],
      ["technology.belongs_to_category", "Technology", "TechnologyCategory"],
      ["credential.issued_by", "Credential", "Organisation"],
      ["credential.issued_to", "Credential", "Person"],
    ],
  );
  assert.equal(new Set(predicateRegistry.map((entry) => entry.id)).size, predicateRegistry.length);
});

test("registry definitions and their entity type collections are immutable", () => {
  assert.equal(Object.isFrozen(predicateRegistry), true);
  for (const entry of predicateRegistry) {
    assert.equal(entry.status, "active");
    assert.match(entry.introducedIn, /^0\.[12]\.0$/);
    assert.equal(Object.isFrozen(entry), true);
    assert.equal(Object.isFrozen(entry.subjectTypes), true);
    assert.equal(Object.isFrozen(entry.objectTypes), true);
  }
});

test("resolves exact IDs and validates direction and entity pairs", () => {
  assert.equal(getPredicate("engagement.with_organisation").objectTypes[0], "Organisation");
  assert.equal(getPredicate("technology.belongs_to_category").introducedIn, "0.2.0");
  assert.equal(
    validatePredicateUse("credential.issued_to", "Credential", "Person").id,
    "credential.issued_to",
  );
  assert.throws(
    () => validatePredicateUse("credential.issued_to", "Person", "Credential"),
    /does not allow/,
  );
  assert.throws(() => getPredicate("worked_at"), /Unknown predicate/);
});

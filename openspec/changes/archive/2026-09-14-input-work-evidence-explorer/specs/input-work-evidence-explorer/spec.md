## ADDED Requirements

### Requirement: Work inspection has explicit authority and scope

The skill SHALL confirm authority and purpose and SHALL state included sources, exclusions, metadata
and history access, privacy, retention expectation, and allowed operations before deep inspection.

#### Scenario: A person selects one project folder

- **WHEN** the person authorises private exploration of that folder
- **THEN** the skill inventories the bounded folder and does not inspect adjacent paths or execute content

### Requirement: Inspection is incremental and read-only by default

The skill SHALL inventory before deep reading, SHALL propose a high-value subset for confirmation,
and MUST NOT execute code, builds, macros, package scripts, downloads, or network calls implicitly.

#### Scenario: A repository contains a package script

- **WHEN** the script appears during inspection
- **THEN** the skill treats it as source evidence and does not run it

### Requirement: Operating mode is honest

The skill SHALL use `governed-import` only for individually captured, provenance-preserving artefacts
with candidate staging and SHALL otherwise return a `session-only`, `not-persisted` preview.

#### Scenario: A host can read a design attachment but cannot capture it

- **WHEN** the skill explores the attachment
- **THEN** it reports a session-only result without claiming import, storage, admission, or verification

### Requirement: Observations and attribution remain separate

The skill SHALL distinguish direct observations, person statements, and derivations and SHALL preserve
source locators, attribution state, uncertainty, and disclosure limits.

#### Scenario: Version history names the person as an author

- **WHEN** an authorised commit is inspected
- **THEN** authorship of that change may be observed but impact, intent, and exclusive ownership remain unproven

### Requirement: Exploration is profession-neutral

The skill SHALL adapt its evidence lenses to the work and role without rewarding activity volume,
fashionable terminology, employer prestige, repository size, or visual polish.

#### Scenario: The source is a teaching plan

- **WHEN** meaningful evidence concerns learning design and iteration
- **THEN** the skill explores those decisions rather than forcing software-engineering categories

### Requirement: Admission and evaluation remain separate

The skill SHALL stage supported proposals through existing candidate boundaries where available and
MUST NOT admit, publish, or formally evaluate the person.

#### Scenario: The person confirms a contribution proposal

- **WHEN** the proposal is submitted to a candidate tool
- **THEN** it remains staged until a separate admission decision

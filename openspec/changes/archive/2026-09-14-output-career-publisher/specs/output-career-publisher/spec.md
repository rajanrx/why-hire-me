## ADDED Requirements

### Requirement: Parent consumes one completed authorised input

The skill SHALL validate one exact release or completed projection with identity, digest, manifest,
authority, policy, and expiry and MUST NOT read canonical storage or rebuild content.

#### Scenario: A projection manifest fails validation

- **WHEN** publication is requested
- **THEN** planning stops without invoking any destination

### Requirement: Destination children are discovered

The skill SHALL route only to installed compatible destination child skills and MUST NOT emulate an
unavailable child or import vendor behaviour into the parent.

#### Scenario: NotebookLM support is not installed

- **WHEN** that destination is selected
- **THEN** the plan reports unsupported without attempting another integration

### Requirement: Publication plans identify exact actions

For each destination the skill SHALL record exact input digests, destination identifier, visibility,
operation, conflict policy, idempotency, credential-source name, and retraction limits.

#### Scenario: A portfolio is planned for Firebase

- **WHEN** the plan is previewed
- **THEN** the exact files, site, visibility, operation, and limitations are visible before confirmation

### Requirement: Confirmation is destination-specific

The skill SHALL default to dry-run and SHALL require explicit action-time confirmation for each exact
destination plan without reusing consent from local generation or another destination.

#### Scenario: GitHub is confirmed but Firebase is not

- **WHEN** execution begins
- **THEN** only the GitHub child may be invoked

### Requirement: Parent cannot handle credentials or upload

The skill MUST NOT read secret values, call vendor APIs, transform payloads after preview, or claim a
destination result independently of its child.

#### Scenario: A credential environment variable is named

- **WHEN** the plan records it
- **THEN** only the source name is retained and the child resolves its value at runtime

### Requirement: Destination results remain independent and honest

The skill SHALL preserve planned, confirmed, attempted, accepted, uploaded, observed visibility,
partial, failed, conflict, unsupported, and cancelled states per child.

#### Scenario: One of two destinations fails

- **WHEN** the other child succeeds
- **THEN** aggregate status is partial and neither result is rewritten or rolled back implicitly

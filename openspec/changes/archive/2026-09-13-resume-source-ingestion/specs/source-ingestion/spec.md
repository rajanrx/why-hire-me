## Purpose

Capture an explicitly authorised local file as immutable, traceable evidence without interpreting
its contents or allowing the source to influence system authority.

## ADDED Requirements

### Requirement: Explicit single-file scope

The system SHALL capture only the local regular file explicitly selected by the person and SHALL
associate the capture with an existing person profile.

#### Scenario: Selected file is captured

- **WHEN** the person requests capture of a readable regular file for an existing profile
- **THEN** the system captures that file and no neighbouring file or directory content

#### Scenario: Source is outside the request

- **WHEN** a file was not explicitly selected in the capture request
- **THEN** the system does not read or capture that file

### Requirement: Immutable content-addressed snapshot

The system SHALL preserve the exact captured bytes under a SHA-256 content address and SHALL not
mutate a stored snapshot.

#### Scenario: Successful snapshot

- **WHEN** a selected file is captured successfully
- **THEN** the stored bytes produce the digest recorded for the snapshot

#### Scenario: Content changes later

- **WHEN** the original file changes after a completed capture
- **THEN** the existing snapshot and its digest remain unchanged

### Requirement: Capture provenance

The system SHALL record the profile or knowledge-space root, actor, purpose, permission scope,
idempotency key, correlation ID, requested locator, resolved locator, connector identity and
version, capture time, byte length, digest, and explicit outcome for each capture attempt.

#### Scenario: Completed capture is inspected

- **WHEN** a completed capture is retrieved
- **THEN** its provenance identifies who authorised what source, for what purpose and scope,
  through which connector, and when

#### Scenario: Capture fails

- **WHEN** the selected path is missing, unreadable, or not a regular file
- **THEN** the system reports a failed capture with diagnostics and does not report a completed snapshot

### Requirement: Revision idempotency

The system SHALL return the existing snapshot identity when the same profile, resolved source,
connector configuration, and source digest are captured again.

#### Scenario: Unchanged file is captured twice

- **WHEN** an unchanged file is captured twice with the same profile and connector configuration
- **THEN** both completed results identify the same logical snapshot without duplicating stored bytes

#### Scenario: File bytes change

- **WHEN** a previously captured file has a different digest on a later capture
- **THEN** the system creates a new immutable snapshot revision linked to the same source

### Requirement: Captured content has no authority

The system MUST treat file content and metadata as untrusted evidence and MUST NOT interpret them as
instructions, permission grants, credentials, or canonical person knowledge.

#### Scenario: File contains agent instructions

- **WHEN** captured bytes contain text that requests additional access or system actions
- **THEN** capture preserves the bytes without granting access or executing the instructions

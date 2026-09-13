# domain-dependency-conformance Specification

## Purpose
Keep bounded contexts independently changeable by making illegal production dependencies visible
and blocking them before code can enter the main branch.

## Requirements

### Requirement: Domain-local production imports

Production code inside a domain SHALL import only modules owned by the same domain and SHALL NOT
import another domain, adapter, or application entry point.

#### Scenario: Domain uses an owned port

- **WHEN** a domain needs a capability supplied by another part of the system
- **THEN** it expresses that need through a contract owned inside its own boundary

#### Scenario: Cross-domain import is introduced

- **WHEN** production domain code imports a module from another bounded context
- **THEN** automated architecture conformance fails and identifies the importing file

### Requirement: Edge composition remains permitted

The system SHALL permit apps, adapters, and tests to translate and compose domain-owned contracts
without granting one domain access to another domain's repository.

#### Scenario: Application verifies a profile before capture

- **WHEN** capture requires an existing person profile
- **THEN** edge composition adapts the profile capability to the acquisition-owned port

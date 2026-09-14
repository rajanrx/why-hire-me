## MODIFIED Requirements

### Requirement: Source-available code and protected identity

Every package and plugin manifest SHALL identify PolyForm-Strict-1.0.0, and every release archive
SHALL include the licence, copyright notice, commercial-licensing guidance, and trademark policy.
Public documentation SHALL describe the project as source-available rather than OSI-approved open
source. Governed portfolio outputs SHALL carry a non-personal public build marker without telemetry,
analytics, fingerprinting, or phone-home requests.

#### Scenario: Qualifying personal use

- **WHEN** a person uses an unmodified copy solely for a purpose permitted by PolyForm Strict
- **THEN** the public licence permits that use without a licence fee

#### Scenario: Professional or commercial use

- **WHEN** a use is outside the purposes permitted by the public licence
- **THEN** documentation directs the user to obtain a separate paid written licence

#### Scenario: A copy or fork is modified or distributed

- **WHEN** a party wants to modify or redistribute the software
- **THEN** the public licence does not grant that permission and the trademark policy grants no right to present another product as official

#### Scenario: A public governed portfolio is discovered

- **WHEN** a maintainer runs the documented public-code search
- **THEN** it searches for the static non-personal build marker without requiring generated portfolios to contact the project

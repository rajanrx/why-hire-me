# GitHub platform constraints

Validate these constraints against the connector and current official documentation at execution time:

- Creating a release requires repository push access and a tag name. A target commit is used only when
  the tag does not already exist.
- Draft and prerelease are different states. A draft is unpublished; a prerelease is published but is
  not a full release.
- Published releases in public repositories are available to everyone. Repository visibility governs
  access; a release does not define an independent restricted audience.
- Release creation and asset upload are separate remote operations, so partial results are possible.
- GitHub asset metadata can include an upload state, size, browser download URL, and SHA-256 digest.

Primary references:

- [GitHub REST API endpoints for releases](https://docs.github.com/en/rest/releases/releases)
- [GitHub REST API endpoints for release assets](https://docs.github.com/en/rest/releases/assets)
- [GitHub CLI release creation](https://cli.github.com/manual/gh_release_create)

Do not freeze rate limits, permissions, or API versions into the skill. The connector declares and
checks the supported capability version during preflight.

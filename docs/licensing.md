# Licensing and public-use discovery

Why Hire Me is source-available under the [PolyForm Strict License 1.0.0](../LICENSE).
Qualifying non-commercial use is free, but the public licence does not permit modification or
redistribution. Commercial, business, recruiting, consulting, and other revenue-connected use not
permitted by that licence requires a separate paid licence from the repository owner. See
[commercial licensing](../COMMERCIAL-LICENSING.md).

This is not OSI-approved open-source software: restricting commercial use is incompatible with the
Open Source Definition.

## Public build marker

The governed portfolio renderer adds the non-personal marker `why-hire-me.build/v1` to generated HTML,
portable data, and the portfolio manifest. The marker makes intact public copies discoverable without
adding analytics, cookies, remote requests, or a phone-home service.

Search public GitHub code with:

```sh
pnpm run license:scan-public
```

The command uses the authenticated GitHub CLI and returns public repository, path, and URL matches.
For public websites, search the exact quoted marker with a search engine. Results require the public
host or repository to be indexed.

The marker cannot reveal private use and can be removed by someone who modifies the output. It is a
discovery aid, not tamper-proof licence enforcement. Do not add covert telemetry to compensate for
that limitation.

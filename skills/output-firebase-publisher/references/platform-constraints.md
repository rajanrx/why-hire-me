# Firebase Hosting platform constraints

Validate these constraints with the connector and current official documentation before every deploy:

- Firebase Hosting deploys files from a configured public root to public `web.app` and
  `firebaseapp.com` subdomains or a configured custom domain.
- Hosting preview channels provide temporary, shareable URLs. Those URLs are public even when they are
  difficult to guess and even when the channel expires automatically.
- A live deploy and a preview-channel deploy are separate operations. Restrict connector scope to the
  intended Hosting site.
- Deploy targets require local `.firebaserc` mappings. A connector running in an isolated directory
  must instead receive an explicit site ID or construct and validate the required mapping.
- Local emulation is the only non-public preview supported by this leaf.
- Firebase Hosting rollback and release management cannot recall copies already downloaded or cached.
- Hosting invalidates its CDN cache on redeploy, but browser cache headers can still make an open
  page use older CSS or JavaScript. Inspect headers and verify a fresh browser session separately.
  Site-isolated `headers` rules can set `Cache-Control`; they belong in the exact preview and
  confirmation plan, not in a post-deploy repair.

Primary references:

- [Get started with Firebase Hosting](https://firebase.google.com/docs/hosting/quickstart)
- [Test locally, use preview channels, and deploy live](https://firebase.google.com/docs/hosting/test-preview-deploy)
- [Manage Hosting resources and releases](https://firebase.google.com/docs/hosting/manage-hosting-resources)
- [Configure Hosting behaviour](https://firebase.google.com/docs/hosting/full-config)

Do not freeze quotas, expiry maxima, CLI flags, or authentication mechanisms into the skill. The
connector declares supported capabilities and verifies current limits during preflight.

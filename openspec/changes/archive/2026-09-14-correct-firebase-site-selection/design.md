## Context

Firebase target names are local aliases whose project-to-site mappings are stored in `.firebaserc`.
The adapter deliberately supplies a minimal environment and a fresh working directory, so a target in
`firebase.json` cannot be resolved there without reconstructing user configuration.

## Decision

The reference connector accepts a Firebase project ID and concrete Hosting site ID. It emits a
single-site `firebase.json` using the `site` property. Preview uses the Hosting channel command;
live delivery adds `--only hosting`. The connector neither reads nor writes the user's Firebase
project directory.

The flow is: explicit project and site IDs, validated identities, isolated single-site configuration,
then either a Hosting preview channel or a Hosting-only live deployment.

Using a direct site ID is appropriate for this single-site isolated connector. A future multi-site
connector may construct an explicit target mapping, but cannot silently inherit one.

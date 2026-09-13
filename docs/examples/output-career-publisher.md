# Career publisher example

Use the parent skill when you want one reviewed release sent to one or more supported destinations.
It creates the plan and delegates each action to a destination child.

## Prompt

```text
Use why-hire-me:output-career-publisher with portfolio manifest ./career-portfolio/manifest.json.
Plan a public Firebase Hosting site and a versioned GitHub release. Dry-run only: show exact files,
digests, destination identifiers, visibility, credential-source names, and retraction limits. Ask for
separate confirmation immediately before each destination action.
```

## Expected plan

```yaml
status: draft
input:
  projectionDigest: sha256:example
  validation: validated
destinations:
  - childSkill: output-firebase-publisher
    requestedVisibility: public
    confirmation: not-requested
    state: planned
  - childSkill: output-github-release
    requestedVisibility: public
    confirmation: not-requested
    state: planned
```

If only one child succeeds, the aggregate result is `partial`. The parent must report each child's
observed state and cannot claim that an accepted upload is publicly reachable.

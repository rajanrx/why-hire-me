## Why

Firebase deploy targets are resolved through local project mappings. The reference publisher runs in
an isolated directory and must not assume or copy that unrelated local configuration.

## What Changes

- Require one explicit existing Firebase Hosting site ID.
- Write that site ID into the isolated single-site Firebase configuration.
- Use Hosting-only live deploy and the Hosting-specific preview-channel command.
- Remove the runtime dependency on local deploy-target mappings.

## Capabilities

### Modified Capabilities

- `output-firebase-publisher`: Make site selection explicit and functional in isolated staging.

## Impact

The development CLI option changes from `--target` to `--site`. No canonical knowledge, release,
portfolio bytes, Firebase resources, or unrelated local project configuration are modified.

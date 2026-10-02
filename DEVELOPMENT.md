# Developing the ArchiVerif SDK

This repository uses the Voxgig generator for four read-only ArchiVerif operations. Generated TypeScript source is checked in so changes to the SDK can be reviewed. Upstream generator scaffolding and build output are restored locally.

## Start from a clean clone

Node.js 24 or later, npm, and Git are required. Setup downloads the locked development dependencies and pinned scaffolder; it does not need an ArchiVerif API key.

The complete implementation is on `docs/experience` while the three stacked pull requests are under review:

```sh
git clone --branch docs/experience https://github.com/MohanedB/archiverif-sdk-voxgig.git
cd archiverif-sdk-voxgig
npm run setup
npm run generate
npm run build
npm run typecheck
npm test
npm run check:drift
npm run test:package
npm run pack:sdk
```

On Windows, use `npm.cmd` if PowerShell blocks the npm script shim. Run these commands from the repository root. The package's generated test suite depends on files restored by setup.

`npm run pack:sdk` produces `mohanedb-archiverif-sdk-0.1.0.tgz`. Install the archive in a separate application:

```sh
npm install /path/to/mohanedb-archiverif-sdk-0.1.0.tgz
```

Use a Windows path where appropriate. The package is not published to npm. Packing must compile the runtime and include its JavaScript and declarations; installed consumers do not need the Voxgig generator.

## What belongs in Git

| Files | Purpose |
| --- | --- |
| `spec/openapi.original.json`, `scripts/prepare-spec.mjs` | Original API description and explicit four-operation selection. |
| `.sdk/model/` | Inspectable generator model and project configuration. |
| `.sdk/package.json`, `.sdk/package-lock.json`, bootstrap/build scripts | Toolchain versions and restoration procedure. |
| `.sdk/overrides/Package_ts.ts`, `.sdk/overrides/clean.cjs` | Deliberate package/build customizations. |
| `ts/src/`, `ts/package.json`, `ts/package-lock.json` | Reviewable generated runtime source and package dependencies. |
| `tests/`, Windows-path regression test, documentation, examples, notices | Project-owned validation, usage, and attribution. |

The ignored files include the reduced `.sdk/def/openapi.readonly.json` (recreated by `npm run spec`), restored `.sdk/src/`, `.sdk/tm/`, `.sdk/test/`, hidden model configuration, generated `ts/test/`, and compiled `ts/dist/` and `ts/dist-test/`. The editable `ts/test/sdk-test-control.json` is tracked as an exception. Expanded test JSON is generated from the restored Aontu sources. Dependencies, local credentials, and package archives are also ignored. The generated TypeScript Makefile and nested ignore file are omitted; root npm commands and ignore rules define the supported workflow.

The bootstrap restores the standard scaffold from `@voxgig/create-sdkgen` 0.30.6, including `.model-config`. It uses the installed, locked sdkgen 4.34.0 toolchain to add the TypeScript target, restores the offline test inputs, and applies the two tracked overrides. The hidden model configuration supplies the model build hooks and must be present for generation.

Do not place lasting edits in these restored directories. Put project settings in the tracked model and intentional component/template changes in the override layer. Bootstrap can replace the restored copies.

## Change the API surface

1. Review the original API description and update the explicit allowlist in `scripts/prepare-spec.mjs` when changing scope.
2. Keep API-specific metadata and inference adjustments in `.sdk/model/`. Preserve the authored root/package README settings.
3. Run generation, build, type checking, tests, and drift validation from the clean-clone sequence above.
4. Review the generated changes in the reduced specification, model, `ts/src/`, and package metadata. Regenerate again and confirm that these tracked files remain unchanged.

The normalization step adds the service URL and a `ClientKey` security scheme, removes the duplicate ordinary credential-header parameter, and preserves the selected operations' referenced schemas. It must retain these authentication semantics:

- Credentials come from `options.apikey` and are sent as the raw `X-Client-Key` header value.
- Missing credentials are omitted; no Bearer prefix is added.
- `Verify().load({ id })` maps to the encoded `licence_id` path segment.
- Response data, nullable values, source attribution, and error status/body remain available to callers.

The custom HTTP contract tests use a local server and synthetic records/credentials. The generated tests use an offline transport. `npm test` must not require a live service or account.

## Upgrade the generator deliberately

Update the scaffolder pin and dependency lockfiles together in a fresh clone, then restore the scaffold and inspect upstream changes before reapplying overrides. Bootstrap overlays copies and does not prune files removed by an upstream release; a fresh clone avoids carrying those stale files across upgrades. Review both `Package_ts.ts` and `clean.cjs` against the new upstream behavior; remove an override when it is no longer needed.

The Windows filesystem workaround is guarded to `@tabnas/multisource` 0.5.8 and an exact source match. A version or source mismatch requires investigation rather than weakening the guard. Re-run the native/virtual filesystem regression checks after changes.

The raw generator doctor reports intentional local customizations. `npm run check:drift` accepts only the documented findings and fails on any extra or missing finding. Review a changed finding set before updating its expectation. Do not silently accept all nonzero doctor results.

Validate an upgrade in a fresh clone on Linux and Windows, check regeneration stability, and install the packed archive into a separate consumer with install scripts disabled. Confirm the archive includes `dist/ArchiverifSDK.js`, its declaration file, notices, and required runtime modules.

## Optional live checks

`npm run smoke` performs bounded live GET probes. It checks health and authentication rejection; with `ARCHIVERIF_API_KEY` set, it also reads the document-type catalogue. It suppresses credentials and response bodies. An absent usable key leaves authenticated success unverified.

For the bundled example, copy `.env.example` to `.env`, supply your key, and run `npm run example`. The ordinary test suite stays offline. Never commit `.env` or a real client key.

## Review sequence

| Branch | Pull request base | Scope |
| --- | --- | --- |
| `feat/sdk` | `main` | Bootstrap, specification/model, and generated SDK source. |
| `test/validation` | `feat/sdk` | HTTP contracts, regression checks, and Linux/Windows CI. |
| `docs/experience` | `test/validation` | Usage examples and experience report. |

The final branch contains the complete project. The pull requests remain unmerged until Mohaned authorizes merging.

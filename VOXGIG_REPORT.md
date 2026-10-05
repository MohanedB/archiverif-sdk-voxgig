# Voxgig SDK Generator — Developer Experience Report

2 October 2026

## API selected

I chose ArchiVerif, my own SaaS project, which helps users check Québec contractor licences and monitor companies through a watchlist. Knowing its authentication and response shapes gave me a useful baseline for assessing the generated client.

I checked the [Voxgig catalogue](https://voxgig.com/voxgig-sdk) on 2 October 2026. Its [search](https://voxgig.com/api/sdk/search?q=archiverif) returned zero results, and the [complete catalogue](https://voxgig.com/api/sdk/catalog.json) contained 637 entries with no ArchiVerif match.

I selected four GET operations: `/v1/document-types`, `/v1/verify/{licence_id}`, `/v1/watchlist`, and `/v1/keys/me`. They cover lists, path parameters, pagination, authentication, and a Pro/Entreprise-only endpoint without including administrative or mutation operations.

## Setup

I used Windows, Node 24.16.0, and the actual [Voxgig tooling](https://voxgig.com/sdk): `@voxgig/create-sdkgen` 0.30.6 and `@voxgig/sdkgen` 4.34.0. I followed the [upstream build guide](https://github.com/voxgig/create-sdkgen/blob/bc24c9d72b27f55ac0ef78f34a86f076ccb0aa85/AGENTS.md), which uses `.aontu` models; some website examples still used `.aon`.

I saved the service's OpenAPI 3.1 document in `spec/openapi.original.json`. `scripts/prepare-spec.mjs` extracts the selected operations and their referenced schemas. My specification omitted the server URL and a security scheme, so I added the verified URL and declared `ClientKey` as an `apiKey` in `X-Client-Key`. These were corrections to my API description.

I added the TypeScript target and offline test feature. To keep the repository reviewable, I retain generated SDK source in `ts/src/`, specifications, model configuration, lockfiles, and two explicit overrides. Setup restores upstream generator components, templates, test sources, and hidden `.model-config` from pinned tooling. Generated tests, expanded JSON corpora, and compiled JavaScript stay outside Git. [DEVELOPMENT.md](DEVELOPMENT.md) explains the bootstrap and regeneration commands.

## What worked well

The generator produced entity methods, runtime helpers, TypeScript declarations, and offline tests. Captured requests sent the raw `X-Client-Key` value, and `Verify().load({ id })` mapped the generated argument to `licence_id`. The watchlist result retained its response envelope.

I found the generated documentation checks useful: they compile and execute the README's TypeScript examples with an offline transport. Keeping project decisions in the model and tracked overrides also makes their relationship to generated output visible during review.

## Friction / issues encountered

- **Windows installation:** I expected automatic dependency installation to work. The scaffolder's `spawn('npm')` call failed with `ENOENT`, which I reproduced independently. I used `--no-install`, followed by direct `npm.cmd` commands. Adding targets alongside `--no-install` correctly required an installed toolchain, so I added them afterward. [Upstream implementation](https://github.com/voxgig/create-sdkgen/blob/bc24c9d72b27f55ac0ef78f34a86f076ccb0aa85/src/create-sdkgen.ts#L228).
- **Filesystem resolution:** Generation treated an injected native Windows filesystem as POSIX. My `windows-paths.cjs` workaround checks `@tabnas/multisource` version 0.5.8 and the exact source before applying the correction. It refuses an unexpected dependency version.
- **Build scripts and packaging:** Unix cleanup commands and shell quoting needed adjustment for PowerShell. I keep the package component and cleanup helper as explicit overrides. Packing builds the runtime because compiled output is absent from Git.
- **Response types:** Several nullable fields became `any`, and the watchlist response produced an empty interface. Runtime data remained available through `.data()`. I retained the generated types so these limitations remain visible.
- **Project metadata:** Stock prose assumes an unofficial catalogue SDK. I supplied my package metadata and maintained the READMEs while retaining upstream notices.

## Suggested improvements

1. Exercise automatic installation and generated build/test scripts in a Windows end-to-end scaffold test.
2. Distinguish native and POSIX virtual filesystems, with regression coverage for both.
3. Preserve nullable unions and response alternatives, and flag schemas that degrade to `any` or empty interfaces.
4. Warn when a credential-looking header has no OpenAPI security scheme.
5. Offer an own-API preset for package metadata and documentation, plus a source-only repository layout that restores pinned upstream scaffolding.

## Testing

From a fresh checkout, dependency installation, generation, build and TypeScript checking passed. Both dependency installations reported zero known vulnerabilities at the time of the check. I deleted the SDK entry-point source and regenerated it: the file was restored and the tracked diff stayed empty. This also checked that the hidden model build hooks were restored, rather than generation merely exiting successfully.

The generated suite ran 216 tests: 215 passed and one cost-feature test was skipped because that feature is not enabled. Nine HTTP contract tests and four Windows-path/diagnostic regression tests passed. The README checks compiled and ran all five TypeScript examples using an offline transport. [CI passed on Linux and Windows](https://github.com/MohanedB/archiverif-sdk-voxgig/actions/runs/37074912877).

Voxgig's raw `doctor` exits 1 for the package component override and added cleanup template. The drift check accepts exactly those two findings. A source-only package check built the archive without existing compiled output or generated tests, installed it in a separate consumer with install scripts disabled, checked runtime/declaration entry points, and exercised the installed client against a local HTTP server.

The live smoke check returned 200 for `/healthz` and 401 through the generated `/v1/document-types` client with missing and invalid keys. I had no usable client key at first. On 4 October 2026 I reran it with a real client key: the generated client's authenticated `/v1/document-types` request succeeded and returned six document types for Québec. The verify, watchlist and key-info operations were not exercised against production.

## Final observations

I built a four-operation TypeScript SDK with the Voxgig generator and documented the changes needed on Windows. The package is `@mohanedb/archiverif-sdk` 0.1.0, with CommonJS output and TypeScript declarations; it has not been published to npm. The generated tests and model were useful, while response typing and Windows setup need improvement. I would resolve the type gaps and exercise the remaining operations live before depending on it for production integrations.

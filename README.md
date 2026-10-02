# ArchiVerif SDK

A small TypeScript SDK for [ArchiVerif](https://archiverif.ca), a Québec contractor
licence and company-monitoring service. Generated with the
[Voxgig SDK tooling](https://voxgig.com/sdk) from the service's actual FastAPI
OpenAPI 3.1 description. Also usable from JavaScript on Node.js 24+.

## Project status

Implementation is reviewed in three focused branches. Each builds on the previous
one; the final branch contains the complete deliverable. Changes remain in pull
requests until reviewed and merged.

| Review area | Pull request / branch |
| --- | --- |
| Reproducible generation and SDK source | [#1](https://github.com/MohanedB/archiverif-sdk-voxgig/pull/1) · `feat/sdk` |
| HTTP contracts and Linux/Windows CI | [#2](https://github.com/MohanedB/archiverif-sdk-voxgig/pull/2) · `test/validation` |
| Usage examples and experience report | `docs/experience` |

The SDK is not published to npm. Its local package name is
`@mohanedb/archiverif-sdk`.

## Install and run

Use the complete branch while the pull requests are under review:

```sh
git clone --branch docs/experience https://github.com/MohanedB/archiverif-sdk-voxgig.git
cd archiverif-sdk-voxgig
npm run setup
npm run build
npm run typecheck
npm test
npm run pack:sdk
```

Install the resulting `mohanedb-archiverif-sdk-0.1.0.tgz` in your application with
`npm install /path/to/mohanedb-archiverif-sdk-0.1.0.tgz`.
On Windows, use a Windows path and `npm.cmd` if PowerShell blocks the npm shim.

## Quickstart

Set `ARCHIVERIF_API_KEY` to a valid client key. The SDK sends its raw value in the
`X-Client-Key` header; Firebase web sign-in is not the direct API authentication.

```ts
import { ArchiverifSDK } from '@mohanedb/archiverif-sdk'

const client = new ArchiverifSDK({ apikey: process.env.ARCHIVERIF_API_KEY })
const types = await client.DocumentType().list({ jurisdiction: 'QC' })
console.log(types.map(item => item.data()))
```

Use an async function or a module that supports top-level `await`. CommonJS
consumers can use `require('@mohanedb/archiverif-sdk')`.

## API scope

| GET endpoint | SDK operation |
| --- | --- |
| `/v1/document-types` | `client.DocumentType().list({ jurisdiction: 'QC' })` |
| `/v1/verify/{licence_id}` | `client.Verify().load({ id: licenceId })` |
| `/v1/watchlist` | `client.Watchlist().load({ limit: 20, offset: 0 })` |
| `/v1/keys/me` | `client.KeyInfo().load()` — Pro/Entreprise only |

List results are entity objects; call `.data()` on each. The other operations
return one entity. Watchlist `.data()` retains the response envelope. No billing,
notification, upload, administrative or mutation endpoints are included.

## Development

The checked-in SDK source lives in `ts/src/`. The original specification, a
documented read-only subset, locked generator dependencies and project overrides
make generation reproducible. Upstream scaffolding, generated test corpora and
compiled JavaScript are recreated locally instead of stored in Git.

`npm run generate` rebuilds from the specification. `npm test` runs generated
offline suites and focused HTTP contract tests. `npm run smoke` makes a few safe
live GET requests; successful authenticated validation requires a real client key.
Copy `.env.example` to `.env` and replace the placeholder to run the bundled
example with `npm run example`. Never commit `.env`.

Known generator limitations include weak nullable-field types and an empty
watchlist interface. Successful live authentication has not been verified without
a usable client key. The [experience report](https://github.com/MohanedB/archiverif-sdk-voxgig/blob/docs/experience/VOXGIG_REPORT.md)
records actual setup, test results, workarounds and suggested improvements.
See [DEVELOPMENT.md](DEVELOPMENT.md) for regeneration, package validation and
toolchain upgrades.

## License

MIT © 2026 Mohaned Bouzaidi. Upstream notices are retained; see [LICENSE](LICENSE)
and [NOTICE](NOTICE).

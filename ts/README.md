# ArchiVerif TypeScript SDK

`@mohanedb/archiverif-sdk` provides four read-only ArchiVerif operations. It is generated using [Voxgig](https://voxgig.com/sdk) and packages CommonJS JavaScript with TypeScript declarations. Node.js 24 or later is required.

## Install

The package is not published to npm. From a clone of [the repository](https://github.com/MohanedB/archiverif-sdk-voxgig), run these commands at the repository root:

```sh
npm run setup
npm run build
npm run pack:sdk
```

Install the resulting archive in your application:

```sh
npm install /path/to/mohanedb-archiverif-sdk-0.1.0.tgz
```

Use a local Windows path and `npm.cmd` where needed. Packing compiles the runtime; the installed package does not need the generator.

## List document types

Provide a valid client key through `ARCHIVERIF_API_KEY`. The SDK sends its raw value in the `X-Client-Key` header.

```ts
import { ArchiverifSDK } from '@mohanedb/archiverif-sdk'

const client = new ArchiverifSDK({ apikey: process.env.ARCHIVERIF_API_KEY })
const documentTypes = await client.DocumentType().list({ jurisdiction: 'QC' })
console.log(documentTypes.map(item => item.data()))
```

These examples use top-level `await`; place the calls in an async function if your application does not support it. CommonJS applications can obtain the client with `const { ArchiverifSDK } = require('@mohanedb/archiverif-sdk')`.

## Verify a licence

The generated `id` argument maps to the API's `licence_id` path parameter. Replace the illustrative identifier with the licence you want to check.

```ts
import { ArchiverifSDK } from '@mohanedb/archiverif-sdk'

const client = new ArchiverifSDK({ apikey: process.env.ARCHIVERIF_API_KEY })
const verification = await client.Verify().load({ id: '1234-5678-90' })
console.log(verification.data())
```

## Read the watchlist

The watchlist call returns one entity containing the complete response envelope. `limit` and `offset` are query parameters; the SDK does not automatically fetch every page.

```ts
import { ArchiverifSDK } from '@mohanedb/archiverif-sdk'

const client = new ArchiverifSDK({ apikey: process.env.ARCHIVERIF_API_KEY })
const watchlist = await client.Watchlist().load({ limit: 20, offset: 0 })
console.log(watchlist.data())
```

## Read current-key information

`GET /v1/keys/me` requires Pro or Entreprise. This example selects plan and rate metadata, leaving the credential prefix out of the output.

```ts
import { ArchiverifSDK } from '@mohanedb/archiverif-sdk'

const client = new ArchiverifSDK({ apikey: process.env.ARCHIVERIF_API_KEY })
const keyInfo = await client.KeyInfo().load()
console.log({ plan: keyInfo.data().plan, rateLimit: keyInfo.data().rate_limit_per_minute })
```

## Results, errors, and type limits

`DocumentType().list()` returns entity objects; call `.data()` on each for its record. The other three methods return one entity. Watchlist `.data()` retains its envelope and source attribution.

HTTP failures reject the operation. Catch the rejection to inspect its `status`, parsed `result.body`, and `result.headers`. Contract tests cover 401, 403, 404, 422, and 429 responses, including `Retry-After`. The default client does not silently retry these rejected requests.

Several nullable properties currently generate as `any`, and the generated `Watchlist` interface is empty. Its runtime data remains available, but accessing envelope fields requires your own checks and narrowing. Inspect `src/ArchiverifTypes.ts` for the generated models; they have not been manually strengthened.

## Development

Use the repository-root setup before development. It restores pinned generator components, templates, and test inputs. `npm run generate` updates the checked-in runtime source and creates ignored generated tests; `npm run build`, `npm run typecheck`, and `npm test` compile and validate them. Make API-shape changes in the specification/model and lasting generator changes in tracked overrides.

See the [development guide](https://github.com/MohanedB/archiverif-sdk-voxgig/blob/main/DEVELOPMENT.md) for the tracked/generated layout and upgrade process. The [experience report](https://github.com/MohanedB/archiverif-sdk-voxgig/blob/main/VOXGIG_REPORT.md) records validation and Windows workarounds. Successful live authenticated responses remain unverified without a usable client key.

MIT licensed. Preserve [LICENSE](LICENSE) and [NOTICE](NOTICE) when redistributing the package.

# API specification

`openapi.original.json` is the unchanged public FastAPI response downloaded on
2026-10-02 from
https://verifrbq-backend-production.up.railway.app/openapi.json.

- OpenAPI 3.1.0, ArchiVerif API 1.0.0
- 42 paths and 68 component schemas
- SHA-256: `e191a9606b71f0c4322893977a2aafeffac09ad21b41779f8a09e0f5c678d4f2`

`npm run spec` deterministically derives `.sdk/def/openapi.readonly.json`:

1. Keep GET operations for document types, licence verification, watchlist and key metadata.
2. Retain the 19 referenced schemas unchanged, including OpenAPI 3.1 nullable unions.
3. Add the deployed server URL, absent from the original document.
4. Replace each optional `X-Client-Key` header parameter with an API-key security
   scheme and global security requirement. The backend requires this header even
   though its FastAPI parameter is marked optional.

The backend authentication implementation and API documentation were inspected
to confirm header-based client keys; Firebase sign-in to the web application is
not the direct API authentication mechanism. The production API was not modified.

Administrative, write, notification, billing and document-download operations are
outside this SDK's scope. `scripts/prepare-spec.mjs` contains the exact allowlist.
The unauthenticated health endpoint is absent from OpenAPI and is checked directly
by the smoke script; it is not advertised as a generated SDK operation.

import { ArchiverifSDK } from '../ts/dist/ArchiverifSDK.js'

// After installation, import ArchiverifSDK from '@mohanedb/archiverif-sdk' instead.
// Keep API credentials on the server. Set ARCHIVERIF_API_KEY outside source control.
const apikey = process.env.ARCHIVERIF_API_KEY
if (!apikey) {
  console.error('Set ARCHIVERIF_API_KEY before running this authenticated example')
  process.exitCode = 1
} else {
  try {
    const sdk = new ArchiverifSDK({
      apikey,
      ...(process.env.ARCHIVERIF_BASE_URL ? { base: process.env.ARCHIVERIF_BASE_URL } : {}),
      system: {
        fetch: (url, options = {}) => fetch(url, { ...options, signal: AbortSignal.timeout(15_000) }),
      },
    })
    const documentTypes = await sdk.DocumentType().list({ jurisdiction: 'QC' })
    // Each generated entity exposes the API record through .data().
    const records = documentTypes.map(entity => entity.data())
    console.log(`Fetched ${records.length} document types; response records are available in records`)
  } catch (error) {
    // Report only the numeric status, never the credential or raw API payload.
    console.error(`Catalog request failed (HTTP ${Number.isInteger(error?.status) ? error.status : 'unavailable'})`)
    process.exitCode = 1
  }
}

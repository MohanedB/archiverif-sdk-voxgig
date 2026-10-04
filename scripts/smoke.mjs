import { ArchiverifSDK } from '../ts/dist/ArchiverifSDK.js'

// Production probes are deliberately small GETs. Never print credentials or bodies.
const base = 'https://verifrbq-backend-production.up.railway.app'
const timedFetch = (url, options = {}) => fetch(url, { ...options, signal: AbortSignal.timeout(15_000) })

async function main() {
  const health = await timedFetch(`${base}/healthz`)
  if (health.status !== 200) throw new Error('Health probe did not return 200')
  const payload = await health.json()
  if (payload.status !== 'ok') throw new Error('Health probe did not report ok')
  console.log('PASS public health: HTTP 200, service healthy')

  for (const [label, apikey] of [['missing key', ''], ['invalid key', 'archiverif-sdk-smoke-invalid-key']]) {
    const sdk = new ArchiverifSDK({ base, apikey, system: { fetch: timedFetch } })
    let rejected = false
    try {
      await sdk.DocumentType().list({ jurisdiction: 'QC' })
    } catch (error) {
      if (error?.status !== 401) throw new Error('Authentication rejection probe did not return 401')
      rejected = true
    }
    if (!rejected) throw new Error('Authentication rejection probe unexpectedly succeeded')
    console.log(`PASS generated SDK ${label}: HTTP 401`)
  }

  const apikey = process.env.ARCHIVERIF_API_KEY
  if (!apikey) {
    console.log('SKIP authenticated catalog: ARCHIVERIF_API_KEY is not set; authenticated success remains unverified')
    return
  }
  const sdk = new ArchiverifSDK({ base, apikey, system: { fetch: timedFetch } })
  const rows = await sdk.DocumentType().list({ jurisdiction: 'QC' })
  if (!Array.isArray(rows)) throw new Error('Catalog result was not an array')
  console.log(`PASS authenticated catalog: ${rows.length} document types (payload suppressed)`)
}

main().catch(() => {
  // Even unexpected transport/API errors may contain untrusted text or credentials.
  console.error('FAIL live smoke check; no request credentials or response payloads were logged')
  process.exitCode = 1
})

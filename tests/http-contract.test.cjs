'use strict'

const assert = require('node:assert/strict')
const http = require('node:http')
const { once } = require('node:events')
const { inspect } = require('node:util')
const test = require('node:test')
const { ArchiverifSDK } = require('../ts/dist/ArchiverifSDK.js')

// All records and credentials in this suite are synthetic. No remote calls occur.
const API_KEY = 'synthetic-contract-key-43b91'
const SOURCE = 'Régie du bâtiment du Québec (CC BY 4.0)'
const DOCUMENT_TYPE = {
  code: 'other', label_fr: 'Autre', label_en: 'Other', short_fr: 'Autre', short_en: 'Other',
  validity_hint_fr: '', validity_hint_en: '', jurisdiction: null, order: 99,
  parsed: false, requestable: true, reuse_eligible: false, is_active: true,
  verify_url: null, verify_note_fr: null, verify_note_en: null,
}

async function localApi(t, body, status = 200, headers = {}) {
  const requests = []
  const server = http.createServer((request, response) => {
    requests.push({ method: request.method, url: request.url, headers: request.headers })
    response.writeHead(status, { 'content-type': 'application/json', ...headers })
    response.end(JSON.stringify(body))
  })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  t.after(async () => {
    const closed = new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
    server.closeAllConnections()
    await closed
  })
  const base = `http://127.0.0.1:${server.address().port}`
  return { requests, base, client: new ArchiverifSDK({ base, apikey: API_KEY }) }
}

test('catalog request sends raw X-Client-Key, encodes query, and unwraps result entities', async t => {
  const api = await localApi(t, { results: [DOCUMENT_TYPE], count: 1 })
  const rows = await api.client.DocumentType().list({ jurisdiction: 'QC & é' })
  assert.equal(api.requests.length, 1)
  const request = api.requests[0]
  assert.equal(request.method, 'GET')
  assert.equal(request.headers['x-client-key'], API_KEY)
  assert.equal(request.headers.authorization, undefined)
  const url = new URL(request.url, api.base)
  assert.equal(url.pathname, '/v1/document-types')
  assert.deepEqual([...url.searchParams], [['jurisdiction', 'QC & é']])
  assert.equal(rows.length, 1)
  assert.deepEqual(rows[0].data(), DOCUMENT_TYPE)
})

test('optional catalog query and absent credential are omitted', async t => {
  const api = await localApi(t, { results: [], count: 0 })
  const client = new ArchiverifSDK({ base: api.base })
  assert.deepEqual(await client.DocumentType().list(), [])
  assert.equal(api.requests[0].url, '/v1/document-types')
  assert.equal(api.requests[0].headers['x-client-key'], undefined)
  assert.equal(api.requests[0].headers.authorization, undefined)
})

test('watchlist retains offset zero, whole envelope, attribution, false and null', async t => {
  const payload = {
    results: [{
      company_id: 101, neq: null, company_name: 'Synthetic Fixture Inc.',
      jurisdiction: 'QC', status: null, documents: [], suspended: false,
    }],
    count: 1,
    source: { rbq: SOURCE, rena: 'Autorité des marchés publics (AMP)' },
  }
  const api = await localApi(t, payload)
  const row = await api.client.Watchlist().load({ limit: 1, offset: 0, include: 'status' })
  const url = new URL(api.requests[0].url, api.base)
  assert.equal(url.pathname, '/v1/watchlist')
  assert.deepEqual(Object.fromEntries(url.searchParams), { include: 'status', limit: '1', offset: '0' })
  assert.deepEqual(row.data(), payload)
})

test('verify id alias is encoded as one path segment and preserves returned data', async t => {
  const id = 'fixture /?é#'
  const payload = {
    licence_id: id, status: 'Active', is_active_today: false,
    neq: null, suspended_since: null, source: SOURCE,
  }
  const api = await localApi(t, payload)
  const row = await api.client.Verify().load({ id })
  assert.equal(api.requests[0].url, `/v1/verify/${encodeURIComponent(id)}`)
  assert.deepEqual(row.data(), payload)
})

for (const status of [401, 403, 404, 422, 429]) {
  test(`HTTP ${status} exposes status and body while redacting credentials`, async t => {
    const detail = status === 422
      ? [{ type: 'value_error', loc: ['query', 'limit'], msg: 'Invalid synthetic value', input: -1 }]
      : 'Synthetic API failure'
    const api = await localApi(t, { detail, echo: API_KEY }, status, status === 429 ? { 'retry-after': '10' } : {})
    await assert.rejects(api.client.DocumentType().list({ jurisdiction: 'QC' }), error => {
      assert.equal(error.status, status)
      assert.equal(error.result.status, status)
      assert.deepEqual(error.result.body.detail, detail)
      assert.equal(error.notFound, status === 404)
      if (status === 429) assert.equal(error.result.headers['retry-after'], '10')
      for (const rendered of [String(error), error.stack, JSON.stringify(error), inspect(error)]) {
        assert.equal(rendered.includes(API_KEY), false, 'Serialized error must omit the synthetic credential')
      }
      assert.equal(JSON.stringify(error).includes('[redacted]'), true)
      return true
    })
    assert.equal(api.requests.length, 1, 'The default client must not silently retry rejected requests')
  })
}

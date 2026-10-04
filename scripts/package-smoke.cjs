'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const http = require('node:http')
const os = require('node:os')
const path = require('node:path')
const { once } = require('node:events')
const { createRequire } = require('node:module')
const { spawnSync } = require('node:child_process')

// Invoke through npm so Windows uses npm's JavaScript entry point, not a shell.
const npm = process.env.npm_execpath
assert.ok(npm && fs.existsSync(npm), 'Run this check with npm run test:package')
const root = path.resolve(__dirname, '..')
const source = path.join(root, 'ts')
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'archiverif-package-'))
let server

function runNpm(args, cwd) {
  const result = spawnSync(process.execPath, [npm, ...args], {
    cwd, encoding: 'utf8', timeout: 120_000,
  })
  if (result.error) throw result.error
  assert.equal(result.status, 0, `npm ${args[0]} failed:\n${result.stdout}\n${result.stderr}`)
}

async function main() {
  const packageSource = path.join(temporary, 'source')
  const consumer = path.join(temporary, 'consumer')
  fs.mkdirSync(packageSource)
  fs.mkdirSync(consumer)

  // Pack from source alone; the checkout's existing build output cannot mask a
  // broken prepack hook. Reuse installed build tools without packaging them.
  for (const name of ['package.json', 'src', 'scripts', 'README.md', 'LICENSE', 'NOTICE']) {
    const input = path.join(source, name)
    if (fs.existsSync(input)) fs.cpSync(input, path.join(packageSource, name), { recursive: true })
  }
  fs.symlinkSync(path.join(source, 'node_modules'), path.join(packageSource, 'node_modules'),
    process.platform === 'win32' ? 'junction' : 'dir')
  assert.equal(fs.existsSync(path.join(packageSource, 'dist')), false)
  assert.equal(fs.existsSync(path.join(packageSource, 'test')), false)
  runNpm(['pack', '--pack-destination', temporary], packageSource)
  const tarballs = fs.readdirSync(temporary).filter(name => name.endsWith('.tgz'))
  assert.equal(tarballs.length, 1)
  fs.writeFileSync(path.join(consumer, 'package.json'), JSON.stringify({ private: true }))
  runNpm(['install', '--ignore-scripts', '--no-audit', '--no-fund', path.join(temporary, tarballs[0])], consumer)

  const requireConsumer = createRequire(path.join(consumer, 'package.json'))
  const metadataPath = requireConsumer.resolve('@mohanedb/archiverif-sdk/package.json')
  const metadata = requireConsumer(metadataPath)
  for (const entry of [metadata.main, metadata.types]) {
    assert.ok(entry && fs.statSync(path.join(path.dirname(metadataPath), entry)).isFile(),
      'Installed package must contain runtime and declaration entry points')
  }
  const { ArchiverifSDK } = requireConsumer('@mohanedb/archiverif-sdk')
  const fixture = { code: 'synthetic', label_en: 'Synthetic document', jurisdiction: null }
  const requests = []
  server = http.createServer((request, response) => {
    requests.push({ method: request.method, url: request.url })
    response.writeHead(200, { 'content-type': 'application/json' })
    response.end(JSON.stringify({ results: [fixture], count: 1 }))
  })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const client = new ArchiverifSDK({ base: `http://127.0.0.1:${server.address().port}` })
  const rows = await client.DocumentType().list()
  assert.deepEqual(requests, [{ method: 'GET', url: '/v1/document-types' }])
  assert.equal(rows.length, 1)
  assert.deepEqual(rows[0].data(), fixture)
  console.log('Package smoke passed: prepack built from source; clean consumer loaded runtime, types and catalog response.')
}

main().catch(error => {
  console.error(error.message)
  process.exitCode = 1
}).finally(async () => {
  if (server?.listening) {
    const closed = new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
    server.closeAllConnections()
    await closed
  }
  fs.rmSync(temporary, { recursive: true, force: true })
})

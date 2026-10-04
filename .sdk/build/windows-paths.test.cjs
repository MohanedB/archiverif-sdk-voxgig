'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { Aontu } = require('aontu')

function evaluate(source, filename, filesystem) {
  const errors = []
  const result = new Aontu().generate(source, {
    path: filename,
    base: path.dirname(filename),
    fs: filesystem,
    require,
    err: errors,
  })
  assert.equal(errors.length, 0, errors.map(error => error.message).join('\n'))
  return result
}

test('Aontu resolves native file includes with an injected Node filesystem', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'archiverif-aontu-'))
  const apiDirectory = path.join(directory, 'api')
  const entry = path.join(directory, 'sdk.aontu')
  const child = path.join(apiDirectory, 'api-info.aontu')
  // Match the scaffold's bare local include; './' takes a separate package fallback.
  const source = '@"api/api-info.aontu"'
  try {
    fs.mkdirSync(apiDirectory)
    fs.writeFileSync(entry, source)
    fs.writeFileSync(child, 'answer: 42')
    assert.equal(evaluate(source, entry, fs).answer, 42)
    // TypeScript's import-star wrapper is a distinct object with the same functions.
    assert.equal(evaluate(source, entry, { ...fs }).answer, 42)
  } finally {
    // Remove only the two known fixture files; no recursive or computed tree deletion.
    for (const file of [entry, child]) {
      if (fs.existsSync(file)) fs.unlinkSync(file)
    }
    fs.rmdirSync(apiDirectory)
    fs.rmdirSync(directory)
  }
})

test('Aontu retains POSIX paths for an injected virtual filesystem', () => {
  const entry = '/virtual/model/sdk.aontu'
  const files = new Map([
    [entry, '@"api/api-info.aontu"'],
    ['/virtual/model/api/api-info.aontu', 'answer: 42'],
  ])
  const virtualFs = {
    statSync(filename) {
      if (!files.has(filename)) throw Object.assign(new Error('Not found'), { code: 'ENOENT' })
      return { isFile: () => true }
    },
    readFileSync(filename) {
      if (!files.has(filename)) throw Object.assign(new Error('Not found'), { code: 'ENOENT' })
      return files.get(filename)
    },
  }
  assert.equal(evaluate(files.get(entry), entry, virtualFs).answer, 42)
})

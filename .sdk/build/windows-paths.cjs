'use strict'

// Temporary, version-guarded compatibility patch for @tabnas/multisource 0.5.8.
// @voxgig/model injects the real Node filesystem into Aontu. Multisource assumes
// every injected filesystem uses POSIX paths, losing native Windows directories.
// Compare the statSync function, not the namespace object: TypeScript import-star
// wrappers have different object identities but retain the same native function.
const fs = require('node:fs')
const path = require('node:path')

const PACKAGE_NAME = '@tabnas/multisource'
const PACKAGE_VERSION = '0.5.8'
const ORIGINAL = 'const P = null != ctx.meta?.fs ? Path.posix : Path;'
const PATCHED = [
  '// ArchiVerif compatibility patch: injected native fs keeps native paths.',
  'const P = null != ctx.meta?.fs && ctx.meta.fs.statSync !== SystemFs.statSync',
  '    ? Path.posix : Path;',
].join('\n        ')

function patchWindowsPaths() {
  const distDirectory = path.dirname(require.resolve(PACKAGE_NAME))
  const manifestPath = path.resolve(distDirectory, '..', 'package.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  if (manifest.name !== PACKAGE_NAME || manifest.version !== PACKAGE_VERSION) {
    throw new Error(
      `Reassess the Windows paths workaround: expected ${PACKAGE_NAME}@${PACKAGE_VERSION}, ` +
      `found ${manifest.name}@${manifest.version}.`,
    )
  }

  const resolverPath = path.join(distDirectory, 'resolver', 'file.js')
  const source = fs.readFileSync(resolverPath, 'utf8')
  const originalCount = source.split(ORIGINAL).length - 1
  const patchedCount = source.split(PATCHED).length - 1
  if (originalCount === 0 && patchedCount === 1) return 'already patched'
  if (originalCount !== 1 || patchedCount !== 0) {
    throw new Error('Multisource resolver differs from the expected patch anchor; no file changed.')
  }
  fs.writeFileSync(resolverPath, source.replace(ORIGINAL, PATCHED))
  return 'patched'
}

if (require.main === module) console.log(`multisource native paths: ${patchWindowsPaths()}`)
module.exports = { patchWindowsPaths }

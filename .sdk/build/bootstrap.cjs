'use strict'

// Restore published Voxgig scaffolding, keeping only project decisions in Git.
const fs = require('node:fs')
const path = require('node:path')
const { patchWindowsPaths } = require('./windows-paths.cjs')

const sdk = path.resolve(__dirname, '..')
const cache = path.join(sdk, '.cache', 'scaffold')
const definition = path.join(sdk, 'def', 'openapi.readonly.json')

async function bootstrap() {
  patchWindowsPaths()
  const { CreateSdkGen } = require('@voxgig/create-sdkgen')
  const { SdkGen } = require('@voxgig/sdkgen')
  if (!fs.existsSync(definition)) {
    throw new Error('Run npm run spec from the repository root before bootstrapping.')
  }

  // The official creator performs its own placeholder substitutions. It writes
  // only inside the cache; its package.json and root files never replace ours.
  await CreateSdkGen({ debug: 'warn' }).generate({
    name: 'archiverif',
    def: definition,
    root: 'CreateRoot',
    project: 'standard',
    folder: cache,
    install: false,
    target: [],
    feature: [],
  })

  for (const tree of ['src', 'tm', 'test', 'model/.model-config']) {
    fs.cpSync(path.join(cache, '.sdk', tree), path.join(sdk, tree), {
      recursive: true,
    })
  }

  // The action API resolves bundled templates relative to its working folder.
  // target add also installs the upstream test feature and writes its provenance.
  const previousDirectory = process.cwd()
  try {
    process.chdir(sdk)
    await SdkGen({ debug: 'warn' }).action(['target', 'add', 'ts'])
  } finally {
    process.chdir(previousDirectory)
  }

  const overrides = [
    ['Package_ts.ts', 'src/cmp/ts/Package_ts.ts'],
    ['clean.cjs', 'tm/ts/scripts/clean.cjs'],
  ]
  for (const [source, destination] of overrides) {
    const target = path.join(sdk, destination)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.copyFileSync(path.join(sdk, 'overrides', source), target)
  }
  console.log('Restored pinned Voxgig templates and applied the two project overrides.')
}

bootstrap().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

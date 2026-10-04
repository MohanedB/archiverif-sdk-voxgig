
import {
  Content,
  File,
  cmp,
  each,
  omap,
  packageName,
  keywords,
  repoInfo,
  packageVersion,
  authorInfo,
  targetFeatures,
} from '@voxgig/sdkgen'


import {
  Model,
  nom,
} from '@voxgig/apidef'


const Package = cmp(async function Package(props: any) {
  const ctx$ = props.ctx$
  const target = props.target

  const model: Model = ctx$.model

  // WHO WROTE THIS PACKAGE. Per target, falling back to the model-wide value
  // and then to the publisher — so a manifest cannot go on naming Voxgig
  // while the model names someone else, which is exactly what the hardcoded
  // constant here did.
  const author = authorInfo(model, target.name)

  // Gated by applicability: a feature that does not apply to this
  // target must not inject its deps into the generated manifest.
  const feature = targetFeatures(model, target)

  const only = (kind: string, deps: any) =>
    omap(deps, ([k, v]: any) => [v.active && kind === v.kind ? k : undefined, v.version])

  const deps =
    each(feature, (feature: any) =>
      omap(feature.deps?.[target.name], ([k, v]: any) =>
        [v.active ? k : undefined, v]))

      .reduce((a: any, deps: any) => (each(deps, (dep: any) =>
        a[dep.kind][dep.key$] = dep.version), a),
        {
          prod: only('prod', target.deps),
          peer: only('peer', target.deps),
          dev: only('dev', target.deps),
        })

  const SdkName = nom(model, 'Name')
  const { repoUrl, issuesUrl } = repoInfo(model)

  const pkg = {
    name: packageName(model, target.name),
    version: packageVersion(model, target.name),
    description: 'TypeScript SDK for the ArchiVerif API, generated using the Voxgig SDK tooling.',
    keywords: keywords(model),
    homepage: `${repoUrl}#readme`,
    repository: { type: 'git', url: `git+${repoUrl}.git` },
    bugs: { url: issuesUrl },
    main: `dist/${SdkName}SDK.js`,
    type: 'commonjs',
    types: `dist/${SdkName}SDK.d.ts`,

    files: ['dist', 'src', 'scripts', 'README.md', 'LICENSE', 'NOTICE'],
    engines: { node: '>=24' },
    scripts: {
      'pretest': 'npm run build',
      'test': 'node --enable-source-maps --test-concurrency=1 --test "dist-test/**/*.test.js"',
      // Generated tests import the package entry point, so declarations must
      // exist even when typecheck is the first command after setup.
      'typecheck': 'tsc --build src && tsc --project src --noEmit && tsc --project test --noEmit',
      "watch": "tsc --build src test -w",
      // Prune compiled output before building: `tsc --build` is incremental and
      // never deletes .js for a removed source, so entity tests that the model
      // folds away would otherwise keep running from stale dist-test/ and fail.
      "build": "node scripts/clean.cjs && tsc --build src test",
      "build:runtime": "node scripts/clean.cjs --runtime && tsc --build src",
      "prepack": "npm run build:runtime",
      "clean": "node scripts/clean.cjs",
    },
    author,

    license: 'MIT',

    dependencies: deps.prod,
    peerDependencies: deps.peer,
    devDependencies: deps.dev,
  }

  File({ name: 'package.json' }, () => {
    Content(JSON.stringify(pkg, null, 2) + '\n')
  })
})


export {
  Package
}

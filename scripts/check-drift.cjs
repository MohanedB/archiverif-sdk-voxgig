const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { findingsFromOutput } = require('./drift-findings.cjs');
const root = path.resolve(__dirname, '..');
const result = spawnSync(process.execPath,
  [path.join(root, '.sdk/node_modules/@voxgig/sdkgen/bin/voxgig-sdkgen'), 'doctor'],
  { cwd: path.join(root, '.sdk'), encoding: 'utf8' });
if (result.error) throw result.error;
const output = result.stdout + result.stderr;
process.stdout.write(output);
const findings = findingsFromOutput(output);
const expected = [
  'FORKED (will be reverted by `target add`): src/cmp/ts/Package_ts.ts',
  'STALE (no longer written by `target add`): tm/ts/scripts/clean.cjs',
];
if (result.status !== 1 || findings.length !== expected.length ||
    findings.some(f => !expected.includes(f))) {
  throw new Error('Generator drift differs from the two documented package/build customizations.');
}
console.log('Confirmed exactly two documented customizations; raw Voxgig doctor exits 1.');

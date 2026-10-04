const test = require('node:test');
const assert = require('node:assert/strict');
const { findingsFromOutput } = require('../scripts/drift-findings.cjs');

test('ANSI-colored doctor findings match their plain-text equivalents', () => {
  const finding = 'FORKED (will be reverted by `target add`): src/cmp/ts/Package_ts.ts';
  const colored = `\u001b[32mINFO\u001b[39m: \u001b[36msdkgen doctor-finding       ${finding}\u001b[39m\n`;
  assert.deepEqual(findingsFromOutput(colored), [finding]);
  assert.deepEqual(findingsFromOutput(`INFO: sdkgen doctor-finding ${finding}\n`), [finding]);
});

test('additional unexpected drift findings remain visible to the checker', () => {
  assert.deepEqual(findingsFromOutput('INFO: doctor-start\nINFO: doctor-finding MISSING: unexpected.ts\n'),
    ['MISSING: unexpected.ts']);
});

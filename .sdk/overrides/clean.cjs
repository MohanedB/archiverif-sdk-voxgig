const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const outputs = process.argv.includes('--runtime') ? ['dist'] : ['dist', 'dist-test'];
for (const name of outputs) {
  const target = path.resolve(root, name);
  if (path.dirname(target) !== root) throw new Error('Invalid build output path');
  fs.rmSync(target, { recursive: true, force: true });
}

import fs from 'node:fs';

const spec = JSON.parse(fs.readFileSync(new URL('../spec/openapi.original.json', import.meta.url)));
const selected = ['/v1/document-types', '/v1/verify/{licence_id}', '/v1/watchlist', '/v1/keys/me'];
spec.paths = Object.fromEntries(selected.map(path => [path, { get: spec.paths[path].get }]));
spec.servers = [{ url: 'https://verifrbq-backend-production.up.railway.app' }];
spec.components.securitySchemes = {
  ClientKey: { type: 'apiKey', in: 'header', name: 'X-Client-Key' },
};
spec.security = [{ ClientKey: [] }];
for (const path of Object.values(spec.paths)) {
  path.get.parameters = path.get.parameters.filter(p => p.name !== 'X-Client-Key');
}

// Retain original schemas reachable from these operations, including unions.
const refs = new Set();
function visit(value) {
  if (!value || typeof value !== 'object') return;
  if (typeof value.$ref === 'string') {
    const prefix = '#/components/schemas/';
    if (!value.$ref.startsWith(prefix)) throw new Error(`Unsupported reference: ${value.$ref}`);
    const name = value.$ref.slice(prefix.length);
    if (!spec.components.schemas[name]) throw new Error(`Missing schema: ${name}`);
    if (!refs.has(name)) { refs.add(name); visit(spec.components.schemas[name]); }
  }
  for (const child of Object.values(value)) visit(child);
}
visit(spec.paths);
spec.components.schemas = Object.fromEntries(
  Object.entries(spec.components.schemas).filter(([name]) => refs.has(name)),
);
fs.mkdirSync(new URL('../.sdk/def/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('../.sdk/def/openapi.readonly.json', import.meta.url), JSON.stringify(spec, null, 2) + '\n');
console.log(`Prepared ${selected.length} GET operations and ${refs.size} original schemas.`);

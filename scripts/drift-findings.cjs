const { stripVTControlCharacters } = require('node:util');

function findingsFromOutput(output) {
  return [...stripVTControlCharacters(output).matchAll(/doctor-finding\s+(.*)/g)].map(m => m[1].trim());
}
module.exports = { findingsFromOutput };

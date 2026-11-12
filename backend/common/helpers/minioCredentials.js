const { randomBytes } = require('node:crypto');

function readValue(content, key) {
  const matches = [...content.matchAll(new RegExp('^(?:export\\s+)?' + key + '=([^\\r\\n]*)', 'gm'))];
  const value = matches.at(-1)?.[1]?.trim() || '';
  return value.replace(/^(['"])(.*)\1$/, '$2');
}
function updateEnvironment(content, updates) {
  const remaining = { ...updates };
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const result = [];
  for (const line of lines) {
    const match = line.match(/^(?:export\s+)?([A-Z][A-Z0-9_]*)=/);
    if (match && Object.hasOwn(updates, match[1])) {
      if (Object.hasOwn(remaining, match[1])) {
        result.push(match[1] + '=' + remaining[match[1]]);
        delete remaining[match[1]];
      }
    } else result.push(line);
  }
  while (result.at(-1) === '') result.pop();
  for (const [key, value] of Object.entries(remaining)) result.push(key + '=' + value);
  return result.join('\n') + '\n';
}
function generatePassword() {
  return randomBytes(32).toString('hex');
}
module.exports = { readValue, updateEnvironment, generatePassword };

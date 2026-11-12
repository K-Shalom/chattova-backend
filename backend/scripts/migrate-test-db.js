const { assertTestDatabase } = require('../tests/helpers/test-database');
assertTestDatabase();
const { readdirSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const { Client } = require('pg');
const config = require('../config/env');

async function main() {
  const client = new Client({
    host: config.db.host, port: config.db.port, database: config.db.name,
    user: config.db.user, password: config.db.password,
  });
  await client.connect();
  try {
    const directory = join(__dirname, '../../database/migrations');
    await client.query(readFileSync(join(directory, '000_schema_migrations.sql'), 'utf8'));
    for (const filename of readdirSync(directory).filter((name) => /^\d+.*\.sql$/.test(name)).sort()) {
      if (filename.startsWith('000_')) continue;
      const applied = await client.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [filename]);
      if (applied.rowCount) continue;
      await client.query('BEGIN');
      try {
        await client.query(readFileSync(join(directory, filename), 'utf8'));
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
        await client.query('COMMIT');
        console.log('Applied', filename);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
    const files = readdirSync(directory).filter((name) => /^\d+.*\.sql$/.test(name) && !name.startsWith('000_'));
    const result = await client.query('SELECT filename FROM schema_migrations ORDER BY filename');
    const applied = new Set(result.rows.map((row) => row.filename));
    if (files.some((file) => !applied.has(file))) throw new Error('Missing application migrations.');
    console.log('All ' + files.length + ' application migrations verified.');
  } finally {
    await client.end();
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

// config/database.js
//
// Creates one shared "connection pool" to PostgreSQL that the whole backend reuses.
// A pool is better than opening a new connection for every request — it keeps a
// small set of ready-to-use connections open and hands them out as needed.

const { Pool } = require('pg');
const config = require('./env');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
});

// Quick sanity check when the server starts — fail loudly and early if the
// database isn't reachable, instead of only failing on the first real request.
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Connected to PostgreSQL database:', config.db.name))
  .catch((err) => {
    console.error('❌ Could not connect to PostgreSQL:', err.message);
    process.exit(1);
  });

module.exports = pool;

// modules/health/controller.js
//
// A simple endpoint to confirm the server is running and can reach the
// database. Useful for quick manual checks, and later for uptime monitoring.

const pool = require('../../config/database');

async function check(req, res) {
  await pool.query('SELECT 1'); // throws if the database is unreachable

  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
}

module.exports = { check };

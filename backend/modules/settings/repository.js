// modules/settings/repository.js

const pool = require('../../config/database');

async function find(userId) {
  const result = await pool.query(
    'SELECT * FROM user_settings WHERE user_id = $1',
    [userId]
  );
  return result.rows[0] || null;
}

// Always saves the FULL merged preferences object (the service layer is
// responsible for merging partial updates before calling this) — simpler
// and safer than trying to do partial JSONB merges in SQL for deeply nested keys.
async function save(userId, preferences) {
  const result = await pool.query(
    `INSERT INTO user_settings (user_id, preferences)
     VALUES ($1, $2)
     ON CONFLICT (user_id)
     DO UPDATE SET preferences = $2, updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [userId, JSON.stringify(preferences)]
  );
  return result.rows[0];
}

module.exports = { find, save };

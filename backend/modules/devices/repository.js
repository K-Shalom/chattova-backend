// modules/devices/repository.js

const pool = require('../../config/database');

// Creates or updates a device record (same user + same push token = same
// device re-registering, e.g. logging in again on the same phone).
async function upsert({ userId, deviceName, platform, pushToken, appVersion, lastIp }) {
  const result = await pool.query(
    `INSERT INTO devices (user_id, device_name, platform, push_token, app_version, last_ip, last_seen)
     VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
     ON CONFLICT (user_id, push_token)
     DO UPDATE SET device_name = EXCLUDED.device_name,
                   platform = EXCLUDED.platform,
                   app_version = EXCLUDED.app_version,
                   last_ip = EXCLUDED.last_ip,
                   last_seen = CURRENT_TIMESTAMP
     RETURNING *`,
    [userId, deviceName, platform, pushToken, appVersion, lastIp]
  );
  return result.rows[0];
}

async function listByUser(userId) {
  const result = await pool.query(
    `SELECT * FROM devices WHERE user_id = $1 ORDER BY last_seen DESC`,
    [userId]
  );
  return result.rows;
}

async function findById(id, userId) {
  const result = await pool.query(
    `SELECT * FROM devices WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return result.rows[0] || null;
}

async function remove(id, userId) {
  await pool.query(`DELETE FROM devices WHERE id = $1 AND user_id = $2`, [id, userId]);
}

module.exports = { upsert, listByUser, findById, remove };

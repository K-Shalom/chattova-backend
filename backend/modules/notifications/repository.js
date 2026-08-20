// modules/notifications/repository.js

const pool = require('../../config/database');

async function create({ userId, type, title, body, data }) {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, data)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, type, title, body, data ? JSON.stringify(data) : null]
  );
  return result.rows[0];
}

async function findForUser(userId, { limit, before }) {
  const params = [userId];
  let whereClause = 'WHERE user_id = $1';

  if (before) {
    params.push(before);
    whereClause += ` AND created_at < $${params.length}`;
  }

  params.push(limit);

  const result = await pool.query(
    `SELECT * FROM notifications ${whereClause} ORDER BY created_at DESC LIMIT $${params.length}`,
    params
  );
  return result.rows;
}

async function countUnread(userId) {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND read_at IS NULL`,
    [userId]
  );
  return result.rows[0].count;
}

async function markRead(id, userId) {
  const result = await pool.query(
    `UPDATE notifications SET read_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND user_id = $2 AND read_at IS NULL
     RETURNING *`,
    [id, userId]
  );
  return result.rows[0] || null;
}

async function markAllRead(userId) {
  const result = await pool.query(
    `UPDATE notifications SET read_at = CURRENT_TIMESTAMP
     WHERE user_id = $1 AND read_at IS NULL`,
    [userId]
  );
  return result.rowCount;
}

// Inserts notifications for MANY users in a single database round-trip,
// instead of one INSERT per user (which gets slow fast in large groups —
// e.g. a 500-member group chat would otherwise fire 499 separate queries
// for every single message sent).
async function createMany(notifications) {
  if (notifications.length === 0) return [];

  const values = [];
  const placeholders = notifications.map((n, i) => {
    const offset = i * 5;
    values.push(n.userId, n.type, n.title, n.body, n.data ? JSON.stringify(n.data) : null);
    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`;
  });

  const result = await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, data)
     VALUES ${placeholders.join(', ')}
     RETURNING *`,
    values
  );
  return result.rows;
}

module.exports = { create, createMany, findForUser, countUnread, markRead, markAllRead };

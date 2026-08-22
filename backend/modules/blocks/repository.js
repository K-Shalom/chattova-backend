// modules/blocks/repository.js

const pool = require('../../config/database');

async function block(blockerId, blockedId) {
  const result = await pool.query(
    `INSERT INTO blocks (blocker_id, blocked_id)
     VALUES ($1, $2)
     ON CONFLICT (blocker_id, blocked_id) DO NOTHING
     RETURNING *`,
    [blockerId, blockedId]
  );
  return result.rows[0] || null;
}

async function unblock(blockerId, blockedId) {
  await pool.query(
    `DELETE FROM blocks WHERE blocker_id = $1 AND blocked_id = $2`,
    [blockerId, blockedId]
  );
}

// Checks BOTH directions — if either user has blocked the other, treat them
// as blocked (mirrors WhatsApp/Telegram behavior: a block is effectively mutual).
async function isBlockedEitherWay(userIdA, userIdB) {
  const result = await pool.query(
    `SELECT 1 FROM blocks
     WHERE (blocker_id = $1 AND blocked_id = $2)
        OR (blocker_id = $2 AND blocked_id = $1)
     LIMIT 1`,
    [userIdA, userIdB]
  );
  return result.rows.length > 0;
}

async function listBlockedByUser(userId) {
  const result = await pool.query(
    `SELECT b.*, u.username, u.display_name, u.avatar_url
     FROM blocks b
     JOIN users u ON u.id = b.blocked_id
     WHERE b.blocker_id = $1
     ORDER BY b.created_at DESC`,
    [userId]
  );
  return result.rows;
}

module.exports = { block, unblock, isBlockedEitherWay, listBlockedByUser };

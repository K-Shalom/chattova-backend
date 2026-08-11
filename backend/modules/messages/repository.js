// modules/messages/repository.js

const pool = require('../../config/database');

async function createMessage({ conversationId, senderId, replyToId, type, content }) {
  const result = await pool.query(
    `INSERT INTO messages (conversation_id, sender_id, reply_to_id, type, content, created_at)
     VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
     RETURNING id`,
    [conversationId, senderId, replyToId, type, content]
  );
  return findByIdWithSender(result.rows[0].id);
}

async function findById(id) {
  const result = await pool.query('SELECT * FROM messages WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function findByIdWithSender(id) {
  const result = await pool.query(
    `SELECT m.*, u.username AS sender_username, u.display_name AS sender_display_name, u.avatar_url AS sender_avatar_url
     FROM messages m
     LEFT JOIN users u ON u.id = m.sender_id
     WHERE m.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

// Cursor-based pagination: fetches messages older than `before` (a timestamp),
// newest first, limited to `limit`. This is more reliable than page numbers
// once new messages keep arriving while someone is scrolling up.
async function findByConversation(conversationId, { limit, before }) {
  const params = [conversationId];
  let whereClause = 'WHERE m.conversation_id = $1 AND m.deleted_at IS NULL';

  if (before) {
    params.push(before);
    whereClause += ` AND m.server_created_at < $${params.length}`;
  }

  params.push(limit);

  const result = await pool.query(
    `SELECT m.*, u.username AS sender_username, u.display_name AS sender_display_name, u.avatar_url AS sender_avatar_url
     FROM messages m
     LEFT JOIN users u ON u.id = m.sender_id
     ${whereClause}
     ORDER BY m.server_created_at DESC
     LIMIT $${params.length}`,
    params
  );
  return result.rows;
}

module.exports = { createMessage, findById, findByIdWithSender, findByConversation };

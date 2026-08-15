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

// --- Editing ---

async function updateContent(id, newContent) {
  await pool.query(
    `UPDATE messages SET content = $1, edited = TRUE WHERE id = $2`,
    [newContent, id]
  );
  return findByIdWithSender(id);
}

async function saveEditHistory(messageId, oldContent, editedBy) {
  await pool.query(
    `INSERT INTO message_history (message_id, old_content, edited_by) VALUES ($1, $2, $3)`,
    [messageId, oldContent, editedBy]
  );
}

// --- Deleting (soft delete, keeps the row for audit/history) ---

async function softDelete(id, deletedBy) {
  await pool.query(
    `UPDATE messages SET deleted_at = CURRENT_TIMESTAMP, deleted_by = $1 WHERE id = $2`,
    [deletedBy, id]
  );
}

// --- Reactions ---

async function addReaction(messageId, userId, emoji) {
  await pool.query(
    `INSERT INTO message_reactions (message_id, user_id, emoji)
     VALUES ($1, $2, $3)
     ON CONFLICT (message_id, user_id, emoji) DO NOTHING`,
    [messageId, userId, emoji]
  );
  return getReactionsSummary(messageId);
}

async function removeReaction(messageId, userId, emoji) {
  await pool.query(
    `DELETE FROM message_reactions WHERE message_id = $1 AND user_id = $2 AND emoji = $3`,
    [messageId, userId, emoji]
  );
  return getReactionsSummary(messageId);
}

async function getReactionsSummary(messageId) {
  const result = await pool.query(
    `SELECT emoji, COUNT(*)::int AS count, ARRAY_AGG(user_id) AS user_ids
     FROM message_reactions
     WHERE message_id = $1
     GROUP BY emoji
     ORDER BY emoji`,
    [messageId]
  );
  return result.rows;
}

// --- Read receipts ---

async function markMessageRead(messageId, userId) {
  await pool.query(
    `INSERT INTO message_statuses (message_id, user_id, read_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP)
     ON CONFLICT (message_id, user_id)
     DO UPDATE SET read_at = COALESCE(message_statuses.read_at, CURRENT_TIMESTAMP)`,
    [messageId, userId]
  );
}

module.exports = {
  createMessage,
  findById,
  findByIdWithSender,
  findByConversation,
  updateContent,
  saveEditHistory,
  softDelete,
  addReaction,
  removeReaction,
  getReactionsSummary,
  markMessageRead,
};

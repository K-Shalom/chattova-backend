// modules/conversations/repository.js

const pool = require('../../config/database');

async function createConversation({ type, name, description, avatarUrl, createdBy }) {
  const result = await pool.query(
    `INSERT INTO conversations (type, name, description, avatar_url, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [type, name, description, avatarUrl, createdBy]
  );
  return result.rows[0];
}

async function addParticipant(conversationId, userId, role = 'member') {
  const result = await pool.query(
    `INSERT INTO conversation_participants (conversation_id, user_id, role)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [conversationId, userId, role]
  );
  return result.rows[0];
}

async function findConversationById(id) {
  const result = await pool.query('SELECT * FROM conversations WHERE id = $1', [id]);
  return result.rows[0] || null;
}

// Finds an existing direct (1-to-1) conversation between exactly these two users,
// so we never create duplicate direct conversations.
async function findDirectConversationBetween(userIdA, userIdB) {
  const result = await pool.query(
    `SELECT c.*
     FROM conversations c
     WHERE c.type = 'direct'
       AND EXISTS (
         SELECT 1 FROM conversation_participants cp
         WHERE cp.conversation_id = c.id AND cp.user_id = $1 AND cp.status = 'active'
       )
       AND EXISTS (
         SELECT 1 FROM conversation_participants cp
         WHERE cp.conversation_id = c.id AND cp.user_id = $2 AND cp.status = 'active'
       )
       AND (
         SELECT COUNT(*) FROM conversation_participants cp
         WHERE cp.conversation_id = c.id AND cp.status = 'active'
       ) = 2
     LIMIT 1`,
    [userIdA, userIdB]
  );
  return result.rows[0] || null;
}

async function findParticipants(conversationId) {
  const result = await pool.query(
    `SELECT cp.*, u.username, u.display_name, u.avatar_url
     FROM conversation_participants cp
     JOIN users u ON u.id = cp.user_id
     WHERE cp.conversation_id = $1 AND cp.status = 'active'
     ORDER BY cp.joined_at ASC`,
    [conversationId]
  );
  return result.rows;
}

async function isParticipant(conversationId, userId) {
  const result = await pool.query(
    `SELECT 1 FROM conversation_participants
     WHERE conversation_id = $1 AND user_id = $2 AND status = 'active'`,
    [conversationId, userId]
  );
  return result.rows.length > 0;
}

// Lists every active conversation a user belongs to, most recently active first
// (based on the newest message, falling back to when the conversation was created).
async function findConversationsForUser(userId) {
  const result = await pool.query(
    `SELECT c.*,
            (SELECT MAX(server_created_at) FROM messages m WHERE m.conversation_id = c.id) AS last_message_at
     FROM conversations c
     JOIN conversation_participants cp ON cp.conversation_id = c.id
     WHERE cp.user_id = $1 AND cp.status = 'active'
     ORDER BY COALESCE(
       (SELECT MAX(server_created_at) FROM messages m WHERE m.conversation_id = c.id),
       c.created_at
     ) DESC`,
    [userId]
  );
  return result.rows;
}

module.exports = {
  createConversation,
  addParticipant,
  findConversationById,
  findDirectConversationBetween,
  findParticipants,
  isParticipant,
  findConversationsForUser,
};

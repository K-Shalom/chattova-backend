// modules/attachments/repository.js

const pool = require('../../config/database');

async function create({ messageId, filename, mimeType, sizeBytes, storageUrl, checksum }) {
  const result = await pool.query(
    `INSERT INTO attachments (message_id, filename, mime_type, size_bytes, storage_url, checksum)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [messageId, filename, mimeType, sizeBytes, storageUrl, checksum]
  );
  return result.rows[0];
}

async function findByMessageId(messageId, conversationId) {
  const result = await pool.query(
    `SELECT a.* FROM attachments a
     JOIN messages m ON m.id = a.message_id
     WHERE a.message_id = $1 AND m.conversation_id = $2 AND m.deleted_at IS NULL
     ORDER BY a.created_at ASC`,
    [messageId, conversationId]
  );
  return result.rows;
}

// Batch version — fetches attachments for MANY messages in one query
// (used when listing a conversation's messages), avoiding an N+1 query loop.
async function findByMessageIds(messageIds) {
  if (messageIds.length === 0) return [];
  const result = await pool.query(
    `SELECT * FROM attachments WHERE message_id = ANY($1) ORDER BY created_at ASC`,
    [messageIds]
  );
  return result.rows;
}

module.exports = { create, findByMessageId, findByMessageIds };

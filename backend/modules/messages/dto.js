// modules/messages/dto.js

function toMessage(row, reactions = [], attachments = []) {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    sender: row.sender_id ? {
      username: row.sender_username,
      displayName: row.sender_display_name,
      avatarUrl: row.sender_avatar_url,
    } : null,
    replyToId: row.reply_to_id,
    type: row.type,
    content: row.content,
    edited: row.edited,
    deletedAt: row.deleted_at || null,
    createdAt: row.created_at,
    serverCreatedAt: row.server_created_at,
    reactions: reactions.map((r) => ({ emoji: r.emoji, count: r.count, userIds: r.user_ids })),
    attachments: attachments.map((a) => ({
      id: a.id,
      filename: a.filename,
      mimeType: a.mime_type,
      sizeBytes: a.size_bytes,
      storageUrl: a.storage_url,
    })),
  };
}

module.exports = { toMessage };

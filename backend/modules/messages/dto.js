// modules/messages/dto.js

function toMessage(row) {
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
    createdAt: row.created_at,
    serverCreatedAt: row.server_created_at,
  };
}

module.exports = { toMessage };

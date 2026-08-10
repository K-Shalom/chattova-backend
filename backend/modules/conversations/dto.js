// modules/conversations/dto.js

function toConversationSummary(conversation) {
  return {
    id: conversation.id,
    type: conversation.type,
    name: conversation.name,
    description: conversation.description,
    avatarUrl: conversation.avatar_url,
    createdBy: conversation.created_by,
    createdAt: conversation.created_at,
    lastMessageAt: conversation.last_message_at || null,
  };
}

function toParticipant(row) {
  return {
    userId: row.user_id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    role: row.role,
    nickname: row.nickname,
    joinedAt: row.joined_at,
  };
}

function toConversationDetail(conversation, participants) {
  return {
    ...toConversationSummary(conversation),
    participants: participants.map(toParticipant),
  };
}

module.exports = { toConversationSummary, toParticipant, toConversationDetail };

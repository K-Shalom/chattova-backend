// modules/messages/service.js

const AppError = require('../../common/errors/AppError');
const conversationsRepository = require('../conversations/repository');
const { toMessage } = require('./dto');
const messagesRepository = require('./repository');

async function sendMessage(currentUserId, conversationId, { type, content, replyToId }) {
  const isMember = await conversationsRepository.isParticipant(conversationId, currentUserId);
  if (!isMember) {
    throw new AppError('Conversation not found.', 404, 'CONVERSATION_NOT_FOUND');
  }

  if (replyToId) {
    const original = await messagesRepository.findById(replyToId);
    if (!original || original.conversation_id !== conversationId) {
      throw new AppError('The message you are replying to was not found in this conversation.', 422, 'INVALID_REPLY_TO');
    }
  }

  const message = await messagesRepository.createMessage({
    conversationId,
    senderId: currentUserId,
    replyToId: replyToId || null,
    type,
    content,
  });

  return toMessage(message);
}

async function listMessages(currentUserId, conversationId, { limit, before }) {
  const isMember = await conversationsRepository.isParticipant(conversationId, currentUserId);
  if (!isMember) {
    throw new AppError('Conversation not found.', 404, 'CONVERSATION_NOT_FOUND');
  }

  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 30, 1), 100);
  const messages = await messagesRepository.findByConversation(conversationId, {
    limit: safeLimit,
    before: before || null,
  });

  // We fetched newest-first for the LIMIT/cursor logic to work; reverse here
  // so the client receives them in natural reading order (oldest -> newest).
  return messages.reverse().map(toMessage);
}

module.exports = { sendMessage, listMessages };

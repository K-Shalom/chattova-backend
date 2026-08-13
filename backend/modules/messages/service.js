// modules/messages/service.js

const AppError = require('../../common/errors/AppError');
const conversationsRepository = require('../conversations/repository');
const notificationsService = require('../notifications/service');
const attachmentsRepository = require('../attachments/repository');
const { getIO } = require('../../sockets/registry');
const { toMessage } = require('./dto');
const messagesRepository = require('./repository');

function broadcast(conversationId, event, payload) {
  try {
    getIO().to(`conversation:${conversationId}`).emit(event, payload);
  } catch (err) {
    console.error('Socket broadcast failed:', err.message);
  }
}

async function assertMembership(conversationId, userId) {
  const isMember = await conversationsRepository.isParticipant(conversationId, userId);
  if (!isMember) {
    throw new AppError('Conversation not found.', 404, 'CONVERSATION_NOT_FOUND');
  }
}

async function getOwnedMessage(conversationId, messageId, userId) {
  const message = await messagesRepository.findById(messageId);
  if (!message || message.conversation_id !== conversationId) {
    throw new AppError('Message not found.', 404, 'MESSAGE_NOT_FOUND');
  }
  if (message.sender_id !== userId) {
    throw new AppError('You can only modify your own messages.', 403, 'NOT_MESSAGE_OWNER');
  }
  return message;
}

async function notifyOtherParticipants(conversationId, senderId, message) {
  try {
    const participants = await conversationsRepository.findParticipants(conversationId);
    const preview = message.type === 'text'
      ? (message.content || '').slice(0, 100)
      : `sent a ${message.type}`;

    const recipientIds = participants
      .map((p) => p.user_id)
      .filter((id) => id !== senderId);

    await notificationsService.notifyManyUsers(recipientIds, {
      type: 'message',
      title: message.sender_username || 'New message',
      body: preview,
      data: { conversationId, messageId: message.id },
    });
  } catch (err) {
    console.error('Failed to create message notifications:', err.message);
  }
}

async function sendMessage(currentUserId, conversationId, { type, content, replyToId }) {
  await assertMembership(conversationId, currentUserId);

  if (replyToId) {
    const original = await messagesRepository.findById(replyToId);
    if (!original || original.conversation_id !== conversationId) {
      throw new AppError('The message you are replying to was not found in this conversation.', 422, 'INVALID_REPLY_TO');
    }
  }

  const message = await messagesRepository.createMessage({
    conversationId, senderId: currentUserId, replyToId: replyToId || null, type, content,
  });

  const dto = toMessage(message); // attachments always empty at creation — added afterward via upload
  broadcast(conversationId, 'message:new', dto);
  notifyOtherParticipants(conversationId, currentUserId, message); // fire-and-forget

  return dto;
}

async function listMessages(currentUserId, conversationId, { limit, before }) {
  await assertMembership(conversationId, currentUserId);

  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 30, 1), 100);
  const messages = await messagesRepository.findByConversation(conversationId, {
    limit: safeLimit, before: before || null,
  });

  // Fetch attachments for every message in ONE query (not one query per
  // message), then group them by message id in memory.
  const messageIds = messages.map((m) => m.id);
  const allAttachments = await attachmentsRepository.findByMessageIds(messageIds);
  const attachmentsByMessage = {};
  for (const att of allAttachments) {
    if (!attachmentsByMessage[att.message_id]) attachmentsByMessage[att.message_id] = [];
    attachmentsByMessage[att.message_id].push(att);
  }

  return messages.reverse().map((row) => toMessage(row, [], attachmentsByMessage[row.id] || []));
}

async function editMessage(currentUserId, conversationId, messageId, newContent) {
  await assertMembership(conversationId, currentUserId);
  const message = await getOwnedMessage(conversationId, messageId, currentUserId);

  if (message.type !== 'text') {
    throw new AppError('Only text messages can be edited.', 422, 'NOT_EDITABLE');
  }

  await messagesRepository.saveEditHistory(messageId, message.content, currentUserId);
  const updated = await messagesRepository.updateContent(messageId, newContent);

  const dto = toMessage(updated);
  broadcast(conversationId, 'message:edited', dto);
  return dto;
}

async function deleteMessage(currentUserId, conversationId, messageId) {
  await assertMembership(conversationId, currentUserId);
  await getOwnedMessage(conversationId, messageId, currentUserId);

  await messagesRepository.softDelete(messageId, currentUserId);

  broadcast(conversationId, 'message:deleted', { messageId, conversationId });
  return { messageId, deleted: true };
}

async function addReaction(currentUserId, conversationId, messageId, emoji) {
  await assertMembership(conversationId, currentUserId);

  const message = await messagesRepository.findById(messageId);
  if (!message || message.conversation_id !== conversationId) {
    throw new AppError('Message not found.', 404, 'MESSAGE_NOT_FOUND');
  }

  const reactions = await messagesRepository.addReaction(messageId, currentUserId, emoji);
  const payload = { messageId, conversationId, reactions: reactions.map((r) => ({ emoji: r.emoji, count: r.count, userIds: r.user_ids })) };
  broadcast(conversationId, 'message:reaction:updated', payload);
  return payload;
}

async function removeReaction(currentUserId, conversationId, messageId, emoji) {
  await assertMembership(conversationId, currentUserId);

  const reactions = await messagesRepository.removeReaction(messageId, currentUserId, emoji);
  const payload = { messageId, conversationId, reactions: reactions.map((r) => ({ emoji: r.emoji, count: r.count, userIds: r.user_ids })) };
  broadcast(conversationId, 'message:reaction:updated', payload);
  return payload;
}

module.exports = { sendMessage, listMessages, editMessage, deleteMessage, addReaction, removeReaction };

// modules/conversations/service.js

const AppError = require('../../common/errors/AppError');
const usersRepository = require('../users/repository');
const { toConversationSummary, toConversationDetail } = require('./dto');
const conversationsRepository = require('./repository');

async function createOrGetDirectConversation(currentUserId, otherUserId) {
  if (currentUserId === otherUserId) {
    throw new AppError('You cannot start a conversation with yourself.', 422, 'INVALID_PARTICIPANT');
  }

  const otherUser = await usersRepository.findById(otherUserId);
  if (!otherUser) {
    throw new AppError('The user you are trying to message does not exist.', 404, 'USER_NOT_FOUND');
  }

  const existing = await conversationsRepository.findDirectConversationBetween(currentUserId, otherUserId);
  if (existing) {
    return toConversationSummary(existing);
  }

  const conversation = await conversationsRepository.createConversation({
    type: 'direct',
    name: null,
    description: null,
    avatarUrl: null,
    createdBy: currentUserId,
  });

  await conversationsRepository.addParticipant(conversation.id, currentUserId, 'member');
  await conversationsRepository.addParticipant(conversation.id, otherUserId, 'member');

  return toConversationSummary(conversation);
}

async function createGroupConversation(currentUserId, { name, description, avatarUrl, participantIds }) {
  const conversation = await conversationsRepository.createConversation({
    type: 'group',
    name,
    description: description || null,
    avatarUrl: avatarUrl || null,
    createdBy: currentUserId,
  });

  // Creator becomes admin automatically (per SAD: created_by grants deletion rights, ADR-011)
  await conversationsRepository.addParticipant(conversation.id, currentUserId, 'admin');

  // Add the rest as regular members, skipping the creator if they included themselves
  const uniqueOtherIds = [...new Set(participantIds)].filter((id) => id !== currentUserId);
  for (const userId of uniqueOtherIds) {
    const user = await usersRepository.findById(userId);
    if (!user) {
      throw new AppError(`User ${userId} does not exist.`, 404, 'USER_NOT_FOUND');
    }
    await conversationsRepository.addParticipant(conversation.id, userId, 'member');
  }

  return toConversationSummary(conversation);
}

async function listMyConversations(currentUserId) {
  const conversations = await conversationsRepository.findConversationsForUser(currentUserId);
  return conversations.map(toConversationSummary);
}

async function getConversationDetail(currentUserId, conversationId) {
  const conversation = await conversationsRepository.findConversationById(conversationId);
  if (!conversation) {
    throw new AppError('Conversation not found.', 404, 'CONVERSATION_NOT_FOUND');
  }

  const isMember = await conversationsRepository.isParticipant(conversationId, currentUserId);
  if (!isMember) {
    // 404 instead of 403 on purpose — we don't want to reveal that a
    // conversation exists to someone who isn't part of it.
    throw new AppError('Conversation not found.', 404, 'CONVERSATION_NOT_FOUND');
  }

  const participants = await conversationsRepository.findParticipants(conversationId);
  return toConversationDetail(conversation, participants);
}

module.exports = {
  createOrGetDirectConversation,
  createGroupConversation,
  listMyConversations,
  getConversationDetail,
};

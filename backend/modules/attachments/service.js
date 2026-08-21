// modules/attachments/service.js

const crypto = require('crypto');
const AppError = require('../../common/errors/AppError');
const conversationsRepository = require('../conversations/repository');
const messagesRepository = require('../messages/repository');
const { uploadBuffer } = require('../../config/storage');
const { toAttachment } = require('./dto');
const attachmentsRepository = require('./repository');

async function uploadAttachment(currentUserId, conversationId, messageId, file) {
  const isMember = await conversationsRepository.isParticipant(conversationId, currentUserId);
  if (!isMember) {
    throw new AppError('Conversation not found.', 404, 'CONVERSATION_NOT_FOUND');
  }

  const message = await messagesRepository.findById(messageId);
  if (!message || message.conversation_id !== conversationId) {
    throw new AppError('Message not found.', 404, 'MESSAGE_NOT_FOUND');
  }
  if (message.sender_id !== currentUserId) {
    throw new AppError('You can only attach files to your own messages.', 403, 'NOT_MESSAGE_OWNER');
  }

  const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');
  const { url } = await uploadBuffer(file.buffer, file.originalname, file.mimetype);

  const attachment = await attachmentsRepository.create({
    messageId,
    filename: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    storageUrl: url,
    checksum,
  });

  const dto = toAttachment(attachment);

  try {
    const { getIO } = require('../../sockets/registry');
    getIO().to(`conversation:${conversationId}`).emit('message:attachment:added', {
      messageId, conversationId, attachment: dto,
    });
  } catch (err) {
    console.error('Socket broadcast failed:', err.message);
  }

  return dto;
}

async function listForMessage(currentUserId, conversationId, messageId) {
  const isMember = await conversationsRepository.isParticipant(conversationId, currentUserId);
  if (!isMember) {
    throw new AppError('Conversation not found.', 404, 'CONVERSATION_NOT_FOUND');
  }

  const rows = await attachmentsRepository.findByMessageId(messageId);
  return rows.map(toAttachment);
}

module.exports = { uploadAttachment, listForMessage };

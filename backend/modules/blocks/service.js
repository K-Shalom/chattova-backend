// modules/blocks/service.js

const AppError = require('../../common/errors/AppError');
const usersRepository = require('../users/repository');
const { toBlockedUser } = require('./dto');
const blocksRepository = require('./repository');

async function blockUser(currentUserId, targetUserId) {
  if (currentUserId === targetUserId) {
    throw new AppError('You cannot block yourself.', 422, 'INVALID_BLOCK');
  }

  const targetUser = await usersRepository.findById(targetUserId);
  if (!targetUser) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }

  await blocksRepository.block(currentUserId, targetUserId);
  return { userId: targetUserId, blocked: true };
}

async function unblockUser(currentUserId, targetUserId) {
  await blocksRepository.unblock(currentUserId, targetUserId);
  return { userId: targetUserId, blocked: false };
}

async function listBlocked(currentUserId) {
  const rows = await blocksRepository.listBlockedByUser(currentUserId);
  return rows.map(toBlockedUser);
}

module.exports = { blockUser, unblockUser, listBlocked };

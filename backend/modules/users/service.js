// modules/users/service.js

const AppError = require('../../common/errors/AppError');
const { toOwnProfile, toPublicProfile } = require('./dto');
const usersRepository = require('./repository');

async function getOwnProfile(userId) {
  const user = await usersRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }
  return toOwnProfile(user);
}

async function getPublicProfile(userId) {
  const user = await usersRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }
  return toPublicProfile(user);
}

async function updateOwnProfile(userId, updates) {
  // Convert any "undefined" (field not sent) to "null" explicitly —
  // the pg library rejects "undefined" but is fine with "null", and our
  // SQL uses COALESCE so "null" here just means "don't change this field".
  const safeUpdates = {
    displayName: updates.displayName ?? null,
    bio: updates.bio ?? null,
    statusMessage: updates.statusMessage ?? null,
    avatarUrl: updates.avatarUrl ?? null,
  };

  const user = await usersRepository.updateProfile(userId, safeUpdates);
  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }
  return toOwnProfile(user);
}

module.exports = { getOwnProfile, getPublicProfile, updateOwnProfile };

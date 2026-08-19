// modules/users/service.js

const bcrypt = require('bcrypt');
const AppError = require('../../common/errors/AppError');
const { toOwnProfile, toPublicProfile } = require('./dto');
const usersRepository = require('./repository');

const SALT_ROUNDS = 12;

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

async function searchUsers(currentUserId, query) {
  if (!query || query.trim().length < 2) {
    throw new AppError('Search text must be at least 2 characters.', 422, 'QUERY_TOO_SHORT');
  }
  const users = await usersRepository.searchByUsername(query.trim(), currentUserId, 20);
  return users.map(toPublicProfile);
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await usersRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }

  const matches = await bcrypt.compare(currentPassword, user.password_hash);
  if (!matches) {
    throw new AppError('Current password is incorrect.', 401, 'INVALID_PASSWORD');
  }

  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await usersRepository.updatePassword(userId, newHash);

  return { message: 'Password updated successfully.' };
}

async function deleteAccount(userId, password) {
  const user = await usersRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }

  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) {
    throw new AppError('Password is incorrect.', 401, 'INVALID_PASSWORD');
  }

  await usersRepository.softDelete(userId);
  return { deleted: true };
}

module.exports = {
  getOwnProfile, getPublicProfile, updateOwnProfile, searchUsers, changePassword, deleteAccount,
};

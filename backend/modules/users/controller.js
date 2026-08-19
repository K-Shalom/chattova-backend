// modules/users/controller.js

const usersService = require('./service');

async function getMe(req, res) {
  const profile = await usersService.getOwnProfile(req.user.id);
  res.status(200).json({ success: true, data: profile });
}

async function updateMe(req, res) {
  const { displayName, bio, statusMessage, avatarUrl } = req.body;
  const profile = await usersService.updateOwnProfile(req.user.id, {
    displayName, bio, statusMessage, avatarUrl,
  });
  res.status(200).json({ success: true, data: profile });
}

async function search(req, res) {
  const results = await usersService.searchUsers(req.user.id, req.query.q);
  res.status(200).json({ success: true, data: results });
}

async function getById(req, res) {
  const profile = await usersService.getPublicProfile(req.params.id);
  res.status(200).json({ success: true, data: profile });
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const result = await usersService.changePassword(req.user.id, currentPassword, newPassword);
  res.status(200).json({ success: true, data: result });
}

async function deleteAccount(req, res) {
  const { password } = req.body;
  const result = await usersService.deleteAccount(req.user.id, password);
  res.status(200).json({ success: true, data: result });
}

module.exports = { getMe, updateMe, search, getById, changePassword, deleteAccount };

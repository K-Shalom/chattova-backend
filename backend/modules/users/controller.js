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

async function getById(req, res) {
  const profile = await usersService.getPublicProfile(req.params.id);
  res.status(200).json({ success: true, data: profile });
}

module.exports = { getMe, updateMe, getById };

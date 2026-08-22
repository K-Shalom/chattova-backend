// modules/settings/controller.js

const settingsService = require('./service');

async function getMine(req, res) {
  const settings = await settingsService.getSettings(req.user.id);
  res.status(200).json({ success: true, data: settings });
}

async function updateMine(req, res) {
  const settings = await settingsService.updateSettings(req.user.id, req.body);
  res.status(200).json({ success: true, data: settings });
}

module.exports = { getMine, updateMine };

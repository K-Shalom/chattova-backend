// modules/notifications/controller.js

const notificationsService = require('./service');

async function list(req, res) {
  const { limit, before } = req.query;
  const result = await notificationsService.listNotifications(req.user.id, { limit, before });
  res.status(200).json({ success: true, data: result });
}

async function markRead(req, res) {
  const notification = await notificationsService.markRead(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: notification });
}

async function markAllRead(req, res) {
  const result = await notificationsService.markAllRead(req.user.id);
  res.status(200).json({ success: true, data: result });
}

module.exports = { list, markRead, markAllRead };

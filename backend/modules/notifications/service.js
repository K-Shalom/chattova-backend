// modules/notifications/service.js

const AppError = require('../../common/errors/AppError');
const { toNotification } = require('./dto');
const notificationsRepository = require('./repository');

async function listNotifications(userId, { limit, before }) {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 30, 1), 100);
  const rows = await notificationsRepository.findForUser(userId, { limit: safeLimit, before: before || null });
  const unreadCount = await notificationsRepository.countUnread(userId);
  return { notifications: rows.map(toNotification), unreadCount };
}

async function markRead(userId, notificationId) {
  const updated = await notificationsRepository.markRead(notificationId, userId);
  if (!updated) {
    throw new AppError('Notification not found or already read.', 404, 'NOTIFICATION_NOT_FOUND');
  }
  return toNotification(updated);
}

async function markAllRead(userId) {
  const count = await notificationsRepository.markAllRead(userId);
  return { markedRead: count };
}

// Called by OTHER modules (e.g. messages) to create + instantly push a
// notification. Wrapped so a socket hiccup never breaks the calling feature.
async function notifyUser(userId, { type, title, body, data }) {
  const notification = await notificationsRepository.create({ userId, type, title, body, data });
  const dto = toNotification(notification);

  try {
    const { getIO } = require('../../sockets/registry');
    getIO().to(`user:${userId}`).emit('notification:new', dto);
  } catch (err) {
    console.error('Notification socket push failed:', err.message);
  }

  return dto;
}

// Batched version of notifyUser — creates all notifications in ONE database
// query, then emits the real-time socket event per user (sockets can't be
// batched the same way since each goes to a different room).
async function notifyManyUsers(userIds, { type, title, body, data }) {
  if (userIds.length === 0) return [];

  const notifications = await notificationsRepository.createMany(
    userIds.map((userId) => ({ userId, type, title, body, data }))
  );

  try {
    const { getIO } = require('../../sockets/registry');
    const io = getIO();
    for (const notification of notifications) {
      io.to(`user:${notification.user_id}`).emit('notification:new', toNotification(notification));
    }
  } catch (err) {
    console.error('Notification socket push failed:', err.message);
  }

  return notifications.map(toNotification);
}

module.exports = { listNotifications, markRead, markAllRead, notifyUser, notifyManyUsers };

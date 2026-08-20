// modules/notifications/dto.js

function toNotification(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    data: row.data || null,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

module.exports = { toNotification };

// modules/devices/dto.js

function toDevice(row) {
  return {
    id: row.id,
    deviceName: row.device_name,
    platform: row.platform,
    appVersion: row.app_version,
    lastIp: row.last_ip,
    trusted: row.trusted,
    lastSeen: row.last_seen,
    createdAt: row.created_at,
  };
}

module.exports = { toDevice };

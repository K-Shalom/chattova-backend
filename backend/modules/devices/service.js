// modules/devices/service.js
//
// NOTE (important limitation to be aware of): removing a device here only
// stops future push notifications to it and removes it from this list — it
// does NOT invalidate any JWT access/refresh tokens already issued to that
// device, since our JWTs are stateless (nothing to revoke server-side).
// True "remote logout" would require a token blacklist or short-lived
// tokens + refresh-token rotation tracked per device — a good Phase 9/10
// hardening task, not needed for the MVP.

const AppError = require('../../common/errors/AppError');
const { toDevice } = require('./dto');
const devicesRepository = require('./repository');

async function listMyDevices(userId) {
  const rows = await devicesRepository.listByUser(userId);
  return rows.map(toDevice);
}

async function removeDevice(userId, deviceId) {
  const device = await devicesRepository.findById(deviceId, userId);
  if (!device) {
    throw new AppError('Device not found.', 404, 'DEVICE_NOT_FOUND');
  }
  await devicesRepository.remove(deviceId, userId);
  return { deviceId, removed: true };
}

module.exports = { listMyDevices, removeDevice };

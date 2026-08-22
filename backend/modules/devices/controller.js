// modules/devices/controller.js

const devicesService = require('./service');

async function list(req, res) {
  const devices = await devicesService.listMyDevices(req.user.id);
  res.status(200).json({ success: true, data: devices });
}

async function remove(req, res) {
  const result = await devicesService.removeDevice(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: result });
}

module.exports = { list, remove };

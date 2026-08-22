// modules/auth/controller.js

const authService = require('./service');

async function register(req, res) {
  const { username, displayName, email, password } = req.body;
  const result = await authService.register({ username, displayName, email, password });
  res.status(201).json({ success: true, data: result });
}

async function login(req, res) {
  const { email, password, deviceName, platform, pushToken, appVersion } = req.body;
  const device = pushToken ? { deviceName, platform, pushToken, appVersion } : null;
  const result = await authService.login({ email, password, device });
  res.status(200).json({ success: true, data: result });
}

module.exports = { register, login };

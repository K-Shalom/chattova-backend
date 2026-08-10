// modules/auth/controller.js
//
// The CONTROLLER layer's only job: read the request, call the service,
// send the response. No business logic and no SQL should ever appear here —
// that keeps this module easy to test and easy to read top-to-bottom.

const authService = require('./service');

async function register(req, res) {
  const { username, displayName, email, password } = req.body;

  const result = await authService.register({ username, displayName, email, password });

  res.status(201).json({
    success: true,
    data: result,
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  const result = await authService.login({ email, password });

  res.status(200).json({
    success: true,
    data: result,
  });
}

module.exports = { register, login };

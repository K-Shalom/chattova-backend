// common/helpers/jwt.js
//
// Small wrapper around jsonwebtoken so every part of the backend generates
// and verifies tokens the same way. We use TWO tokens (per ADR / SAD section 15):
//   - accessToken:  short-lived (15 min), sent with every API request
//   - refreshToken: long-lived (7 days), used only to get a new accessToken
// This limits the damage if an accessToken is ever stolen — it expires fast.

const jwt = require('jsonwebtoken');
const config = require('../../config/env');

function signAccessToken(payload) {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};

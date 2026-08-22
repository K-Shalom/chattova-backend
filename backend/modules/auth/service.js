// modules/auth/service.js

const bcrypt = require('bcrypt');
const AppError = require('../../common/errors/AppError');
const { signAccessToken, signRefreshToken } = require('../../common/helpers/jwt');
const { toPublicUser } = require('./dto');
const authRepository = require('./repository');
const devicesRepository = require('../devices/repository');

const SALT_ROUNDS = 12;

async function register({ username, displayName, email, password }) {
  const existingEmail = await authRepository.findByEmail(email);
  if (existingEmail) {
    throw new AppError('An account with this email already exists.', 409, 'EMAIL_TAKEN');
  }

  const existingUsername = await authRepository.findByUsername(username);
  if (existingUsername) {
    throw new AppError('This username is already taken.', 409, 'USERNAME_TAKEN');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await authRepository.createUser({
    username,
    displayName: displayName || username,
    email,
    passwordHash,
  });

  const tokens = issueTokens(user);

  return { user: toPublicUser(user), ...tokens };
}

async function login({ email, password, device }) {
  const user = await authRepository.findByEmail(email);

  if (!user) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  const tokens = issueTokens(user);

  // Device registration is optional — a client only sends this if it wants
  // multi-device tracking / push notifications (mobile apps typically do;
  // a quick curl test typically doesn't). We only register when a pushToken
  // is provided, since that's the field the UNIQUE constraint relies on.
  if (device && device.pushToken) {
    try {
      await devicesRepository.upsert({
        userId: user.id,
        deviceName: device.deviceName || null,
        platform: device.platform || null,
        pushToken: device.pushToken,
        appVersion: device.appVersion || null,
        lastIp: null,
      });
    } catch (err) {
      console.error('Device registration failed (non-fatal):', err.message);
    }
  }

  return { user: toPublicUser(user), ...tokens };
}

function issueTokens(user) {
  const payload = { sub: user.id, username: user.username };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

module.exports = { register, login };

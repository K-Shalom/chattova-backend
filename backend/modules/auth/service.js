// modules/auth/service.js
//
// The SERVICE layer holds business logic: rules about WHAT is allowed to
// happen (e.g. "email must be unique", "password must match before login").
// Controllers stay thin and just call these functions.

const bcrypt = require('bcrypt');
const AppError = require('../../common/errors/AppError');
const { signAccessToken, signRefreshToken } = require('../../common/helpers/jwt');
const { toPublicUser } = require('./dto');
const authRepository = require('./repository');

const SALT_ROUNDS = 12; // higher = slower but more secure; 12 is a solid default

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

async function login({ email, password }) {
  const user = await authRepository.findByEmail(email);

  // Deliberately vague error message — we never reveal whether it was the
  // email or the password that was wrong. This stops attackers from using
  // the login form to check which emails are registered.
  if (!user) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  const tokens = issueTokens(user);

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

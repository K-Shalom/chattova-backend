// modules/auth/repository.js

const pool = require('../../config/database');

async function findByEmail(email) {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
    [email]
  );
  return result.rows[0] || null;
}

async function findByUsername(username) {
  const result = await pool.query(
    'SELECT * FROM users WHERE username = $1 AND deleted_at IS NULL',
    [username]
  );
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
    [id]
  );
  return result.rows[0] || null;
}

async function createUser({ username, displayName, email, passwordHash }) {
  const AppError = require('../../common/errors/AppError');
  try {
    const result = await pool.query(
      `INSERT INTO users (username, display_name, email, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [username, displayName, email, passwordHash]
    );
    return result.rows[0];
  } catch (err) {
    if (err.code === '23505') {
      if (err.constraint && err.constraint.includes('username')) {
        throw new AppError('This username is already taken.', 409, 'USERNAME_TAKEN');
      }
      if (err.constraint && err.constraint.includes('email')) {
        throw new AppError('An account with this email already exists.', 409, 'EMAIL_TAKEN');
      }
      throw new AppError('This account already exists.', 409, 'DUPLICATE');
    }
    throw err;
  }
}

module.exports = { findByEmail, findByUsername, findById, createUser };
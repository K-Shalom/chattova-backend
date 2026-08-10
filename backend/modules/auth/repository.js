// modules/auth/repository.js
//
// The REPOSITORY layer is the only place allowed to write raw SQL for this
// module. Services never talk to the database directly — they call these
// functions instead. This makes it easy to find every users-table query in
// one place, and to swap the database later without touching business logic.

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
  const result = await pool.query(
    `INSERT INTO users (username, display_name, email, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [username, displayName, email, passwordHash]
  );
  return result.rows[0];
}

module.exports = {
  findByEmail,
  findByUsername,
  findById,
  createUser,
};

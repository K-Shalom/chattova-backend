// modules/users/repository.js

const pool = require('../../config/database');

async function findById(id) {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
    [id]
  );
  return result.rows[0] || null;
}

async function updateProfile(id, { displayName, bio, statusMessage, avatarUrl }) {
  const result = await pool.query(
    `UPDATE users
     SET display_name = COALESCE($1, display_name),
         bio = COALESCE($2, bio),
         status_message = COALESCE($3, status_message),
         avatar_url = COALESCE($4, avatar_url),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $5 AND deleted_at IS NULL
     RETURNING *`,
    [displayName, bio, statusMessage, avatarUrl, id]
  );
  return result.rows[0] || null;
}

async function searchByUsername(searchText, excludeUserId, limit) {
  const result = await pool.query(
    `SELECT * FROM users
     WHERE username ILIKE $1
       AND id != $2
       AND deleted_at IS NULL
     ORDER BY
       CASE WHEN username ILIKE $3 THEN 0 ELSE 1 END,
       username ASC
     LIMIT $4`,
    [`%${searchText}%`, excludeUserId, `${searchText}%`, limit]
  );
  return result.rows;
}

async function updatePassword(id, passwordHash) {
  await pool.query(
    `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
    [passwordHash, id]
  );
}

async function softDelete(id) {
  await pool.query(
    `UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [id]
  );
}

module.exports = { findById, updateProfile, searchByUsername, updatePassword, softDelete };

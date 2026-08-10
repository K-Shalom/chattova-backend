// modules/users/repository.js
//
// Direct database queries for user profiles. Separate from auth/repository.js
// on purpose — auth cares about "login/register", users cares about "profile
// data". Both happen to read the same `users` table, which is normal in a
// modular monolith (ADR-006).

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

module.exports = { findById, updateProfile };

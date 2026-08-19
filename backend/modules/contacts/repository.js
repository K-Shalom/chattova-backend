// modules/contacts/repository.js

const pool = require('../../config/database');

async function addContact(userId, contactUserId, nickname) {
  const result = await pool.query(
    `INSERT INTO contacts (user_id, contact_user_id, nickname)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, contact_user_id)
     DO UPDATE SET nickname = COALESCE(EXCLUDED.nickname, contacts.nickname)
     RETURNING *`,
    [userId, contactUserId, nickname]
  );
  return result.rows[0];
}

async function removeContact(userId, contactUserId) {
  await pool.query(
    `DELETE FROM contacts WHERE user_id = $1 AND contact_user_id = $2`,
    [userId, contactUserId]
  );
}

async function updateContact(userId, contactUserId, { nickname, favorite }) {
  const result = await pool.query(
    `UPDATE contacts
     SET nickname = COALESCE($1, nickname),
         favorite = COALESCE($2, favorite)
     WHERE user_id = $3 AND contact_user_id = $4
     RETURNING *`,
    [nickname, favorite, userId, contactUserId]
  );
  return result.rows[0] || null;
}

async function findContact(userId, contactUserId) {
  const result = await pool.query(
    `SELECT * FROM contacts WHERE user_id = $1 AND contact_user_id = $2`,
    [userId, contactUserId]
  );
  return result.rows[0] || null;
}

// Lists a user's saved contacts, joined with the contact's public profile info,
// favorites first then alphabetical by display name.
async function listContacts(userId) {
  const result = await pool.query(
    `SELECT c.*, u.username, u.display_name, u.avatar_url, u.status_message
     FROM contacts c
     JOIN users u ON u.id = c.contact_user_id
     WHERE c.user_id = $1 AND u.deleted_at IS NULL
     ORDER BY c.favorite DESC, u.display_name ASC`,
    [userId]
  );
  return result.rows;
}

module.exports = { addContact, removeContact, updateContact, findContact, listContacts };

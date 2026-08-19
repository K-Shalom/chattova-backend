// modules/contacts/dto.js

function toContact(row) {
  return {
    userId: row.contact_user_id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    statusMessage: row.status_message,
    nickname: row.nickname,
    favorite: row.favorite,
    addedAt: row.created_at,
  };
}

module.exports = { toContact };

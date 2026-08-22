// modules/blocks/dto.js

function toBlockedUser(row) {
  return {
    userId: row.blocked_id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    blockedAt: row.created_at,
  };
}

module.exports = { toBlockedUser };

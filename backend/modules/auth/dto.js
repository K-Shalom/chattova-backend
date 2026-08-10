// modules/auth/dto.js
//
// DTO = "Data Transfer Object". This controls exactly what we send back to
// the client. The `users` table has fields like password_hash that must
// NEVER leave the server — this function is the one place that decides
// what's safe to expose, so we can't accidentally leak it from a controller.

function toPublicUser(user) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.display_name,
    email: user.email,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    statusMessage: user.status_message,
    isVerified: user.is_verified,
    createdAt: user.created_at,
  };
}

module.exports = { toPublicUser };

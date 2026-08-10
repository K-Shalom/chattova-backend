// modules/users/dto.js
//
// Two shapes on purpose:
// - toOwnProfile: what a user sees about THEMSELVES (includes email/phone)
// - toPublicProfile: what a user sees about SOMEONE ELSE (hides email/phone —
//   other users shouldn't see your contact details just by viewing your profile)

function toOwnProfile(user) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.display_name,
    email: user.email,
    phoneNumber: user.phone_number,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    statusMessage: user.status_message,
    isVerified: user.is_verified,
    createdAt: user.created_at,
  };
}

function toPublicProfile(user) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    statusMessage: user.status_message,
  };
}

module.exports = { toOwnProfile, toPublicProfile };

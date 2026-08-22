// modules/settings/dto.js

function toSettings(row) {
  return {
    preferences: row.preferences,
    updatedAt: row.updated_at,
  };
}

module.exports = { toSettings };

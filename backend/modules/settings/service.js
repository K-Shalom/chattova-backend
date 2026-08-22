// modules/settings/service.js

const deepMerge = require('../../common/helpers/deepMerge');
const { DEFAULT_PREFERENCES } = require('./defaults');
const { toSettings } = require('./dto');
const settingsRepository = require('./repository');

async function getSettings(userId) {
  const row = await settingsRepository.find(userId);

  if (!row) {
    // Brand-new user — nothing saved yet. Return defaults without writing
    // a row to the database (no need to store what's identical to defaults).
    return { preferences: DEFAULT_PREFERENCES, updatedAt: null };
  }

  // Deep-merge saved preferences OVER the defaults, so if we add a new
  // setting in a future app update, existing users automatically get its
  // default value instead of `undefined` breaking the frontend.
  const merged = deepMerge(DEFAULT_PREFERENCES, row.preferences);
  return { preferences: merged, updatedAt: row.updated_at };
}

async function updateSettings(userId, partialUpdates) {
  const current = await getSettings(userId);
  const merged = deepMerge(current.preferences, partialUpdates);

  const saved = await settingsRepository.save(userId, merged);
  return toSettings(saved);
}

module.exports = { getSettings, updateSettings };

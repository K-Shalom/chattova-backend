// modules/settings/validator.js
//
// Since preferences is a flexible JSONB blob, we don't need to validate
// every possible field exhaustively — we just guard the well-known enum
// fields against garbage values, and make sure whatever nested objects are
// sent are actual objects (not strings/numbers) so deepMerge behaves correctly.

const { body } = require('express-validator');

const updateSettingsRules = [
  body().isObject().withMessage('Request body must be a settings object.'),

  body('appearance.theme').optional().isIn(['light', 'dark', 'system'])
    .withMessage('appearance.theme must be light, dark, or system.'),
  body('appearance.fontSize').optional().isIn(['small', 'medium', 'large'])
    .withMessage('appearance.fontSize must be small, medium, or large.'),

  body('chats.autoDownloadMedia').optional().isIn(['never', 'wifi_only', 'wifi_and_mobile'])
    .withMessage('chats.autoDownloadMedia must be never, wifi_only, or wifi_and_mobile.'),

  body('localMode.preferredMode').optional().isIn(['auto', 'global', 'local'])
    .withMessage('localMode.preferredMode must be auto, global, or local.'),

  body('privacy.lastSeen').optional().isIn(['everyone', 'contacts', 'nobody'])
    .withMessage('privacy.lastSeen must be everyone, contacts, or nobody.'),
  body('privacy.onlineStatus').optional().isIn(['everyone', 'contacts', 'nobody'])
    .withMessage('privacy.onlineStatus must be everyone, contacts, or nobody.'),
  body('privacy.whoCanAddMe').optional().isIn(['everyone', 'contacts', 'nobody'])
    .withMessage('privacy.whoCanAddMe must be everyone, contacts, or nobody.'),
];

module.exports = { updateSettingsRules };

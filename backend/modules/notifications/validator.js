// modules/notifications/validator.js

const { param, query } = require('express-validator');

const listRules = [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100.'),
  query('before').optional().isISO8601().withMessage('before must be a valid ISO date.'),
];

const notificationIdParamRule = [
  param('id').isUUID().withMessage('Invalid notification id.'),
];

module.exports = { listRules, notificationIdParamRule };

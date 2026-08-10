// modules/users/validator.js

const { body, param } = require('express-validator');

const updateProfileRules = [
  body('displayName').optional({ checkFalsy: true }).trim().isLength({ max: 100 })
    .withMessage('Display name must be 100 characters or fewer.'),
  body('bio').optional({ checkFalsy: true }).trim().isLength({ max: 500 })
    .withMessage('Bio must be 500 characters or fewer.'),
  body('statusMessage').optional({ checkFalsy: true }).trim().isLength({ max: 150 })
    .withMessage('Status message must be 150 characters or fewer.'),
  body('avatarUrl').optional({ checkFalsy: true }).trim().isURL()
    .withMessage('Avatar URL must be a valid URL.'),
];

const userIdParamRule = [
  param('id').isUUID().withMessage('Invalid user id.'),
];

module.exports = { updateProfileRules, userIdParamRule };

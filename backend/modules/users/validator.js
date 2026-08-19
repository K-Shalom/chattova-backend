// modules/users/validator.js

const { body, param, query } = require('express-validator');

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

const searchRules = [
  query('q').trim().isLength({ min: 2 }).withMessage('q must be at least 2 characters.'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('currentPassword is required.'),
  body('newPassword').isLength({ min: 8 }).withMessage('newPassword must be at least 8 characters.'),
];

const deleteAccountRules = [
  body('password').notEmpty().withMessage('password is required to confirm account deletion.'),
];

module.exports = {
  updateProfileRules, userIdParamRule, searchRules, changePasswordRules, deleteAccountRules,
};

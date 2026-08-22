// modules/blocks/validator.js

const { body, param } = require('express-validator');

const blockUserRules = [
  body('userId').isUUID().withMessage('userId is required and must be a valid user id.'),
];

const blockedUserIdParamRule = [
  param('userId').isUUID().withMessage('Invalid user id.'),
];

module.exports = { blockUserRules, blockedUserIdParamRule };

// modules/conversations/validator.js

const { body, param } = require('express-validator');

const createDirectRules = [
  body('otherUserId').isUUID().withMessage('otherUserId must be a valid user id.'),
];

const createGroupRules = [
  body('name').trim().isLength({ min: 1, max: 100 })
    .withMessage('Group name is required and must be 100 characters or fewer.'),
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 500 })
    .withMessage('Description must be 500 characters or fewer.'),
  body('avatarUrl').optional({ checkFalsy: true }).trim().isURL()
    .withMessage('avatarUrl must be a valid URL.'),
  body('participantIds').isArray({ min: 1 })
    .withMessage('participantIds must be a non-empty array of user ids.'),
  body('participantIds.*').isUUID()
    .withMessage('Each participant id must be a valid UUID.'),
];

const conversationIdParamRule = [
  param('id').isUUID().withMessage('Invalid conversation id.'),
];

const markReadRules = [
  param('id').isUUID().withMessage('Invalid conversation id.'),
  body('messageId').isUUID().withMessage('messageId is required and must be valid.'),
];

module.exports = { createDirectRules, createGroupRules, conversationIdParamRule, markReadRules };

// modules/contacts/validator.js

const { body, param } = require('express-validator');

const addContactRules = [
  body('contactUserId').isUUID().withMessage('contactUserId is required and must be a valid user id.'),
  body('nickname').optional({ checkFalsy: true }).trim().isLength({ max: 100 })
    .withMessage('Nickname must be 100 characters or fewer.'),
];

const updateContactRules = [
  param('contactUserId').isUUID().withMessage('Invalid contact id.'),
  body('nickname').optional({ checkFalsy: true }).trim().isLength({ max: 100 })
    .withMessage('Nickname must be 100 characters or fewer.'),
  body('favorite').optional().isBoolean().withMessage('favorite must be true or false.'),
];

const contactUserIdParamRule = [
  param('contactUserId').isUUID().withMessage('Invalid contact id.'),
];

module.exports = { addContactRules, updateContactRules, contactUserIdParamRule };

// modules/attachments/validator.js

const { param } = require('express-validator');

const messageParamRules = [
  param('id').isUUID().withMessage('Invalid conversation id.'),
  param('messageId').isUUID().withMessage('Invalid message id.'),
];

module.exports = { messageParamRules };

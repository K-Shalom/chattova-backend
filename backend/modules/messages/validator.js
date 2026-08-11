// modules/messages/validator.js

const { body, param, query } = require('express-validator');

const MESSAGE_TYPES = ['text', 'image', 'video', 'audio', 'voice_note', 'file', 'location', 'contact', 'poll'];

const sendMessageRules = [
  param('id').isUUID().withMessage('Invalid conversation id.'),
  body('type').isIn(MESSAGE_TYPES).withMessage(`type must be one of: ${MESSAGE_TYPES.join(', ')}`),
  body('content')
    .if(body('type').equals('text'))
    .trim()
    .notEmpty()
    .withMessage('content is required for text messages.'),
  body('replyToId').optional({ checkFalsy: true }).isUUID().withMessage('replyToId must be a valid message id.'),
];

const listMessagesRules = [
  param('id').isUUID().withMessage('Invalid conversation id.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100.'),
  query('before').optional().isISO8601().withMessage('before must be a valid ISO date.'),
];

module.exports = { sendMessageRules, listMessagesRules };

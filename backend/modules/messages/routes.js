// modules/messages/routes.js
//
// mergeParams: true lets this router see :id (the conversation id) from
// wherever it's mounted. Authentication is already applied by the parent
// conversations router.

const express = require('express');
const messagesController = require('./controller');
const {
  sendMessageRules, listMessagesRules, editMessageRules,
  messageIdParamRules, reactionRules, removeReactionParamRules,
} = require('./validator');
const validate = require('../../common/middleware/validate');
const asyncHandler = require('../../common/middleware/asyncHandler');
const attachmentsRoutes = require('../attachments/routes');

const router = express.Router({ mergeParams: true });

// POST /api/v1/conversations/:id/messages
router.post('/', sendMessageRules, validate, asyncHandler(messagesController.send));

// GET /api/v1/conversations/:id/messages
router.get('/', listMessagesRules, validate, asyncHandler(messagesController.list));

// PATCH /api/v1/conversations/:id/messages/:messageId — edit (sender only, text only)
router.patch('/:messageId', editMessageRules, validate, asyncHandler(messagesController.edit));

// DELETE /api/v1/conversations/:id/messages/:messageId — soft delete (sender only)
router.delete('/:messageId', messageIdParamRules, validate, asyncHandler(messagesController.remove));

// POST /api/v1/conversations/:id/messages/:messageId/reactions — add/toggle a reaction
router.post('/:messageId/reactions', reactionRules, validate, asyncHandler(messagesController.react));

// DELETE /api/v1/conversations/:id/messages/:messageId/reactions/:emoji — remove your reaction
router.delete('/:messageId/reactions/:emoji', removeReactionParamRules, validate, asyncHandler(messagesController.unreact));

// Everything under /api/v1/conversations/:id/messages/:messageId/attachments is handled by the attachments module
router.use('/:messageId/attachments', attachmentsRoutes);

module.exports = router;

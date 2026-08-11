// modules/messages/routes.js
//
// mergeParams: true lets this router see :id from wherever it gets mounted
// (in conversations/routes.js, at '/:id/messages') as req.params.id.
// Authentication is already applied by the parent conversations router.

const express = require('express');
const messagesController = require('./controller');
const { sendMessageRules, listMessagesRules } = require('./validator');
const validate = require('../../common/middleware/validate');
const asyncHandler = require('../../common/middleware/asyncHandler');

const router = express.Router({ mergeParams: true });

// POST /api/v1/conversations/:id/messages
router.post('/', sendMessageRules, validate, asyncHandler(messagesController.send));

// GET /api/v1/conversations/:id/messages
router.get('/', listMessagesRules, validate, asyncHandler(messagesController.list));

module.exports = router;

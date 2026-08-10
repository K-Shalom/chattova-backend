// modules/conversations/routes.js
//
// Every route here requires authentication — you must be logged in to
// create or view conversations.

const express = require('express');
const conversationsController = require('./controller');
const { createDirectRules, createGroupRules, conversationIdParamRule } = require('./validator');
const validate = require('../../common/middleware/validate');
const authenticate = require('../../common/middleware/authenticate');
const asyncHandler = require('../../common/middleware/asyncHandler');
const messagesRoutes = require('../messages/routes');

const router = express.Router();

router.use(authenticate); // applies to every route below

// POST /api/v1/conversations/direct — start (or resume) a 1-to-1 conversation
router.post('/direct', createDirectRules, validate, asyncHandler(conversationsController.createDirect));

// POST /api/v1/conversations/group — create a group conversation
router.post('/group', createGroupRules, validate, asyncHandler(conversationsController.createGroup));

// GET /api/v1/conversations — list my conversations
router.get('/', asyncHandler(conversationsController.listMine));

// GET /api/v1/conversations/:id — one conversation's details + participants
router.get('/:id', conversationIdParamRule, validate, asyncHandler(conversationsController.getOne));

// Everything under /api/v1/conversations/:id/messages is handled by the messages module
router.use('/:id/messages', messagesRoutes);

module.exports = router;

// modules/blocks/routes.js

const express = require('express');
const blocksController = require('./controller');
const { blockUserRules, blockedUserIdParamRule } = require('./validator');
const validate = require('../../common/middleware/validate');
const authenticate = require('../../common/middleware/authenticate');
const asyncHandler = require('../../common/middleware/asyncHandler');

const router = express.Router();

router.use(authenticate);

// GET /api/v1/blocks — list who you've blocked
router.get('/', asyncHandler(blocksController.list));

// POST /api/v1/blocks — block someone
router.post('/', blockUserRules, validate, asyncHandler(blocksController.block));

// DELETE /api/v1/blocks/:userId — unblock someone
router.delete('/:userId', blockedUserIdParamRule, validate, asyncHandler(blocksController.unblock));

module.exports = router;

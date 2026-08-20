// modules/notifications/routes.js
//
// IMPORTANT: /read-all must be registered BEFORE /:id/read, otherwise
// Express would try to match "read-all" as if it were a notification id.

const express = require('express');
const notificationsController = require('./controller');
const { listRules, notificationIdParamRule } = require('./validator');
const validate = require('../../common/middleware/validate');
const authenticate = require('../../common/middleware/authenticate');
const asyncHandler = require('../../common/middleware/asyncHandler');

const router = express.Router();

router.use(authenticate);

// GET /api/v1/notifications — list mine (+ unread count)
router.get('/', listRules, validate, asyncHandler(notificationsController.list));

// PATCH /api/v1/notifications/read-all — mark everything as read
router.patch('/read-all', asyncHandler(notificationsController.markAllRead));

// PATCH /api/v1/notifications/:id/read — mark one as read
router.patch('/:id/read', notificationIdParamRule, validate, asyncHandler(notificationsController.markRead));

module.exports = router;

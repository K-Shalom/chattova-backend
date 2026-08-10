// modules/users/routes.js
//
// Every route here requires authentication (you must be logged in) —
// that's what the `authenticate` middleware enforces on each line.

const express = require('express');
const usersController = require('./controller');
const { updateProfileRules, userIdParamRule } = require('./validator');
const validate = require('../../common/middleware/validate');
const authenticate = require('../../common/middleware/authenticate');
const asyncHandler = require('../../common/middleware/asyncHandler');

const router = express.Router();

// GET /api/v1/users/me — your own full profile
router.get('/me', authenticate, asyncHandler(usersController.getMe));

// PATCH /api/v1/users/me — update your own profile
router.patch('/me', authenticate, updateProfileRules, validate, asyncHandler(usersController.updateMe));

// GET /api/v1/users/:id — another user's public profile
router.get('/:id', authenticate, userIdParamRule, validate, asyncHandler(usersController.getById));

module.exports = router;

// modules/users/routes.js
//
// Every route here requires authentication. IMPORTANT: /search must be
// registered BEFORE /:id — Express matches routes in the order they're
// defined, and /:id would otherwise swallow requests to /search.

const express = require('express');
const usersController = require('./controller');
const {
  updateProfileRules, userIdParamRule, searchRules, changePasswordRules, deleteAccountRules,
} = require('./validator');
const validate = require('../../common/middleware/validate');
const authenticate = require('../../common/middleware/authenticate');
const asyncHandler = require('../../common/middleware/asyncHandler');

const router = express.Router();

router.use(authenticate);

// GET /api/v1/users/me — your own full profile
router.get('/me', asyncHandler(usersController.getMe));

// PATCH /api/v1/users/me — update your own profile
router.patch('/me', updateProfileRules, validate, asyncHandler(usersController.updateMe));

// PATCH /api/v1/users/me/password — change your password
router.patch('/me/password', changePasswordRules, validate, asyncHandler(usersController.changePassword));

// DELETE /api/v1/users/me — deactivate your own account (soft delete)
router.delete('/me', deleteAccountRules, validate, asyncHandler(usersController.deleteAccount));

// GET /api/v1/users/search?q=... — find people by username (must come before /:id)
router.get('/search', searchRules, validate, asyncHandler(usersController.search));

// GET /api/v1/users/:id — another user's public profile
router.get('/:id', userIdParamRule, validate, asyncHandler(usersController.getById));

module.exports = router;

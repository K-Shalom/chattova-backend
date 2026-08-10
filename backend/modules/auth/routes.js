// modules/auth/routes.js
//
// Defines the actual URLs for this module and connects each one to:
// validation rules -> validate middleware -> controller function.
// This file is intentionally "boring" — all the real logic lives elsewhere.

const express = require('express');
const authController = require('./controller');
const { registerRules, loginRules } = require('./validator');
const validate = require('../../common/middleware/validate');
const asyncHandler = require('../../common/middleware/asyncHandler');

const router = express.Router();

// POST /api/v1/auth/register
router.post('/register', registerRules, validate, asyncHandler(authController.register));

// POST /api/v1/auth/login
router.post('/login', loginRules, validate, asyncHandler(authController.login));

module.exports = router;

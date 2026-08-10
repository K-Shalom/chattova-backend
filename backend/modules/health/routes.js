// modules/health/routes.js

const express = require('express');
const healthController = require('./controller');
const asyncHandler = require('../../common/middleware/asyncHandler');

const router = express.Router();

// GET /api/v1/health
router.get('/', asyncHandler(healthController.check));

module.exports = router;

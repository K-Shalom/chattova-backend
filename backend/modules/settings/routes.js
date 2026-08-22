// modules/settings/routes.js

const express = require('express');
const settingsController = require('./controller');
const { updateSettingsRules } = require('./validator');
const validate = require('../../common/middleware/validate');
const authenticate = require('../../common/middleware/authenticate');
const asyncHandler = require('../../common/middleware/asyncHandler');

const router = express.Router();

router.use(authenticate);

// GET /api/v1/settings — your full settings (with defaults filled in)
router.get('/', asyncHandler(settingsController.getMine));

// PATCH /api/v1/settings — partial update (deep-merged with existing values)
router.patch('/', updateSettingsRules, validate, asyncHandler(settingsController.updateMine));

module.exports = router;

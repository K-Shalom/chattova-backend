// modules/devices/routes.js

const express = require('express');
const devicesController = require('./controller');
const { deviceIdParamRule } = require('./validator');
const validate = require('../../common/middleware/validate');
const authenticate = require('../../common/middleware/authenticate');
const asyncHandler = require('../../common/middleware/asyncHandler');

const router = express.Router();

router.use(authenticate);

// GET /api/v1/devices — list devices you've logged in from
router.get('/', asyncHandler(devicesController.list));

// DELETE /api/v1/devices/:id — remove/"log out" a device
router.delete('/:id', deviceIdParamRule, validate, asyncHandler(devicesController.remove));

module.exports = router;

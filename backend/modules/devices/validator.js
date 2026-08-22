// modules/devices/validator.js

const { param } = require('express-validator');

const deviceIdParamRule = [
  param('id').isUUID().withMessage('Invalid device id.'),
];

module.exports = { deviceIdParamRule };

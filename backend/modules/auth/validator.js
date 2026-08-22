// modules/auth/validator.js

const { body } = require('express-validator');

const registerRules = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters.')
    .matches(/^[a-zA-Z0-9_.]+$/)
    .withMessage('Username can only contain letters, numbers, dots and underscores.'),
  body('displayName')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Display name must be 100 characters or fewer.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Please provide a valid email address.'),
  body('password').notEmpty().withMessage('Password is required.'),
  // Device fields are all optional — only used if a client wants multi-device tracking.
  body('deviceName').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('platform').optional({ checkFalsy: true }).trim().isLength({ max: 20 }),
  body('pushToken').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
  body('appVersion').optional({ checkFalsy: true }).trim().isLength({ max: 20 }),
];

module.exports = { registerRules, loginRules };

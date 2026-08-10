// modules/auth/validator.js
//
// These rules run BEFORE the controller. If the request body doesn't match
// (e.g. missing email, password too short), the request is rejected with a
// clear 422 error and the controller code never even runs. This keeps
// "is the input well-formed?" separate from "is this business-logic valid?".

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
];

module.exports = { registerRules, loginRules };

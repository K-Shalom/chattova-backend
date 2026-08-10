// common/middleware/validate.js
//
// Runs after the *Rules arrays (e.g. registerRules) from a module's validator.js.
// If any rule failed, this stops the request here with a 422 response —
// the controller never runs. Keeps validation-error formatting in one place.

const { validationResult } = require('express-validator');
const AppError = require('../errors/AppError');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return next(new AppError(firstError.msg, 422, 'VALIDATION_ERROR'));
  }
  next();
}

module.exports = validate;

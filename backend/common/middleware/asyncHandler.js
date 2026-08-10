// common/middleware/asyncHandler.js
//
// Express doesn't automatically catch errors thrown inside "async" functions.
// Wrapping every controller function with this helper means any error (or
// rejected promise) is automatically passed to errorHandler.js, so we never
// have to write try/catch in every single controller.
//
// Usage:  router.post('/register', asyncHandler(authController.register));

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;

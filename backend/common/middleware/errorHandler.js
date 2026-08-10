// common/middleware/errorHandler.js
//
// This is the LAST middleware in the app (see app.js). Express automatically
// sends any error passed to next(err) here, no matter which route it came from.
// Every error response in the whole API has the same shape:
//   { success: false, error: { code, message } }
// This makes the frontend's error-handling code simple and predictable.

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  // Log unexpected (non-operational) errors so we can debug them —
  // operational errors (like "invalid password") are normal and expected,
  // so we don't need to log those as if something broke.
  if (!err.isOperational) {
    console.error('🔥 Unexpected error:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: err.isOperational ? err.message : 'Something went wrong. Please try again.',
    },
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
}

module.exports = { errorHandler, notFoundHandler };

// common/errors/AppError.js
//
// A custom error type for errors we expect and want to control the shape of
// (e.g. "email already registered" -> 409, "invalid credentials" -> 401).
// This is different from a bug/crash — those are unexpected and get handled
// separately in errorHandler.js.

class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'ERROR';
    this.isOperational = true; // marks this as a "known" error, not a crash
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

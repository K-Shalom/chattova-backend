// common/middleware/authenticate.js
//
// Protects routes that require a logged-in user. Reads the JWT access token
// from the "Authorization: Bearer <token>" header, verifies it, and attaches
// the decoded payload to req.user so later code knows who's making the request.
//
// Usage:  router.get('/me', authenticate, asyncHandler(usersController.getMe));

const AppError = require('../errors/AppError');
const { verifyAccessToken } = require('../helpers/jwt');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required.', 401, 'UNAUTHENTICATED'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired token.', 401, 'INVALID_TOKEN'));
  }
}

module.exports = authenticate;



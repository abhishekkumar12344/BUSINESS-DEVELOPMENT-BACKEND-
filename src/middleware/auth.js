const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/** Verifies the JWT and attaches the live user document to the request. */
const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) throw new ApiError(401, 'Not authorised. Please sign in.');

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Session expired. Please sign in again.');
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, 'This account no longer exists.');
  if (!user.isActive) throw new ApiError(403, 'This account has been deactivated.');

  req.user = user;
  return next();
});

/** Role based access control: authorize('SUPER_ADMIN', 'ADMIN') */
const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Not authorised. Please sign in.'));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, `Your role (${req.user.role}) cannot perform this action.`));
    }
    return next();
  };

/** Super admin only shortcut. */
const superAdminOnly = authorize('SUPER_ADMIN');

module.exports = { protect, authorize, superAdminOnly };

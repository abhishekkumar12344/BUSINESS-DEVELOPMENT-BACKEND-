const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const logActivity = require('../utils/activityLogger');

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  designation: user.designation,
  avatar: user.avatar,
  permissions: user.permissions,
  lastLogin: user.lastLogin
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    await logActivity({ req, action: 'LOGIN', module: 'Auth', description: `Failed sign in for ${email}`, status: 'FAILED' });
    throw new ApiError(401, 'Email or password is incorrect.');
  }
  if (!user.isActive) throw new ApiError(403, 'This account has been deactivated.');

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  req.user = user;
  await logActivity({ req, action: 'LOGIN', module: 'Auth', description: `${user.name} signed in` });

  res.json({ success: true, token: generateToken(user), user: publicUser(user) });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  await logActivity({ req, action: 'LOGOUT', module: 'Auth', description: `${req.user.name} signed out` });
  res.json({ success: true, message: 'Signed out.' });
});

// PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  const { name, phone, designation, currentPassword, newPassword } = req.body;

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (designation !== undefined) user.designation = designation;

  if (newPassword) {
    if (!currentPassword || !(await user.matchPassword(currentPassword))) {
      throw new ApiError(400, 'Current password is incorrect.');
    }
    if (String(newPassword).length < 8) throw new ApiError(400, 'New password must be at least 8 characters.');
    user.password = newPassword;
  }

  await user.save();
  await logActivity({ req, action: 'UPDATE', module: 'Profile', description: 'Profile updated' });
  res.json({ success: true, user: publicUser(user) });
});

module.exports = { login, getMe, logout, updateProfile, publicUser };

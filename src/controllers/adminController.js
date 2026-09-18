const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const logActivity = require('../utils/activityLogger');
const { publicUser } = require('./authController');

// GET /api/admins
const getAdmins = asyncHandler(async (req, res) => {
  const users = await User.find().populate('createdBy', 'name').sort('-createdAt');
  res.json({ success: true, count: users.length, users });
});

// POST /api/admins  (SUPER_ADMIN only)
const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, designation, permissions } = req.body;
  if (!password || password.length < 8) throw new ApiError(400, 'Password must be at least 8 characters.');

  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) throw new ApiError(409, 'An account with this email already exists.');

  const user = await User.create({
    name, email, password, role: role || 'ADMIN', phone, designation,
    permissions: permissions || [], createdBy: req.user._id
  });

  await logActivity({ req, action: 'ADMIN_CREATE', module: 'Admin Management', description: `Created ${role || 'ADMIN'} account for ${name}`, targetId: user._id });
  res.status(201).json({ success: true, user: publicUser(user) });
});

// PUT /api/admins/:id
const updateAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('+password');
  if (!user) throw new ApiError(404, 'Account not found.');

  const { name, role, phone, designation, permissions, isActive, password } = req.body;

  if (user.role === 'SUPER_ADMIN' && role && role !== 'SUPER_ADMIN') {
    const superAdmins = await User.countDocuments({ role: 'SUPER_ADMIN' });
    if (superAdmins <= 1) throw new ApiError(400, 'At least one super admin must remain.');
  }

  if (name !== undefined) user.name = name;
  if (role !== undefined) user.role = role;
  if (phone !== undefined) user.phone = phone;
  if (designation !== undefined) user.designation = designation;
  if (permissions !== undefined) user.permissions = permissions;
  if (isActive !== undefined) user.isActive = isActive;
  if (password) {
    if (password.length < 8) throw new ApiError(400, 'Password must be at least 8 characters.');
    user.password = password;
  }

  await user.save();
  await logActivity({ req, action: 'UPDATE', module: 'Admin Management', description: `Updated account ${user.email}`, targetId: user._id });
  res.json({ success: true, user: publicUser(user) });
});

// DELETE /api/admins/:id
const deleteAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'Account not found.');
  if (String(user._id) === String(req.user._id)) throw new ApiError(400, 'You cannot delete your own account.');
  if (user.role === 'SUPER_ADMIN') {
    const superAdmins = await User.countDocuments({ role: 'SUPER_ADMIN' });
    if (superAdmins <= 1) throw new ApiError(400, 'At least one super admin must remain.');
  }

  await user.deleteOne();
  await logActivity({ req, action: 'DELETE', module: 'Admin Management', description: `Deleted account ${user.email}` });
  res.json({ success: true, message: 'Account deleted.' });
});

// GET /api/admins/activity
const getActivityLogs = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const query = {};
  if (req.query.action) query.action = req.query.action;
  if (req.query.module) query.module = req.query.module;
  if (req.query.user) query.user = req.query.user;

  const [logs, total] = await Promise.all([
    ActivityLog.find(query).sort('-createdAt').skip((page - 1) * limit).limit(limit),
    ActivityLog.countDocuments(query)
  ]);

  res.json({ success: true, logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } });
});

module.exports = { getAdmins, createAdmin, updateAdmin, deleteAdmin, getActivityLogs };

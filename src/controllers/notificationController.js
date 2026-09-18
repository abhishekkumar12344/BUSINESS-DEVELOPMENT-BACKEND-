const asyncHandler = require('../utils/asyncHandler');
const Notification = require('../models/Notification');

const getNotifications = asyncHandler(async (req, res) => {
  const items = await Notification.find().sort('-createdAt').limit(50);
  const unread = await Notification.countDocuments({ isRead: false });
  res.json({ success: true, items, unread });
});

const markRead = asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true, $addToSet: { readBy: req.user._id } });
  res.json({ success: true, message: 'Marked as read.' });
});

const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ isRead: false }, { isRead: true, $addToSet: { readBy: req.user._id } });
  res.json({ success: true, message: 'All notifications marked as read.' });
});

const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Notification removed.' });
});

module.exports = { getNotifications, markRead, markAllRead, deleteNotification };

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, default: '' },
    type: { type: String, enum: ['INFO', 'LEAD', 'CONSULTATION', 'SYSTEM', 'ALERT'], default: 'INFO' },
    link: { type: String, default: '' },
    refModel: { type: String, default: '' },
    refId: { type: mongoose.Schema.Types.ObjectId, default: null },
    isRead: { type: Boolean, default: false },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);

const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    userName: { type: String, default: 'System' },
    userRole: { type: String, default: 'SYSTEM' },
    action: {
      type: String,
      enum: ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'ASSIGN', 'SETTINGS', 'ADMIN_CREATE', 'EXPORT'],
      required: true
    },
    module: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['SUCCESS', 'FAILED'], default: 'SUCCESS' },
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);

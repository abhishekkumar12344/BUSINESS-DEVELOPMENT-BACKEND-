const ActivityLog = require('../models/ActivityLog');

/**
 * Writes an audit trail entry. Never throws - logging must not break a request.
 */
const logActivity = async ({ req, action, module, description = '', status = 'SUCCESS', targetId = null }) => {
  try {
    await ActivityLog.create({
      user: req?.user?._id || null,
      userName: req?.user?.name || 'System',
      userRole: req?.user?.role || 'SYSTEM',
      action,
      module,
      description,
      status,
      targetId,
      ipAddress: req?.ip || '',
      userAgent: req?.headers?.['user-agent'] || ''
    });
  } catch (error) {
    console.error('Activity log failed:', error.message);
  }
};

module.exports = logActivity;

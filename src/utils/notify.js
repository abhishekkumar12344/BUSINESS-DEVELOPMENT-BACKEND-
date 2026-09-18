const Notification = require('../models/Notification');

/** Creates an in-app admin notification (used when a lead/enquiry arrives). */
const notifyAdmins = async ({ title, message, type = 'INFO', link = '', refModel = '', refId = null }) => {
  try {
    await Notification.create({ title, message, type, link, refModel, refId });
  } catch (error) {
    console.error('Notification failed:', error.message);
  }
};

module.exports = notifyAdmins;

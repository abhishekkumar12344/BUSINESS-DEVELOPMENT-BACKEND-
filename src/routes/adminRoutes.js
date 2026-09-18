const express = require('express');
const { body } = require('express-validator');
const { getAdmins, createAdmin, updateAdmin, deleteAdmin, getActivityLogs } = require('../controllers/adminController');
const { getStats } = require('../controllers/dashboardController');
const { getEnquiries, markEnquiryRead, deleteEnquiry, getConsultations, updateConsultation, deleteConsultation } = require('../controllers/enquiryController');
const { getNotifications, markRead, markAllRead, deleteNotification } = require('../controllers/notificationController');
const { uploadMedia, getMedia, deleteMedia } = require('../controllers/mediaController');
const { updateSettings } = require('../controllers/settingsController');
const { protect, authorize, superAdminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

const router = express.Router();
router.use(protect);

// Dashboard
router.get('/dashboard/stats', getStats);

// Enquiries & consultations
router.get('/enquiries', getEnquiries);
router.put('/enquiries/:id/read', markEnquiryRead);
router.delete('/enquiries/:id', authorize('SUPER_ADMIN', 'ADMIN'), deleteEnquiry);
router.get('/consultations', getConsultations);
router.put('/consultations/:id', updateConsultation);
router.delete('/consultations/:id', authorize('SUPER_ADMIN', 'ADMIN'), deleteConsultation);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/read-all', markAllRead);
router.put('/notifications/:id/read', markRead);
router.delete('/notifications/:id', deleteNotification);

// Media library
router.get('/media', getMedia);
router.post('/media', authorize('SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'), upload.single('file'), uploadMedia);
router.delete('/media/:id', authorize('SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'), deleteMedia);

// Website settings
router.put('/settings', authorize('SUPER_ADMIN', 'ADMIN'), updateSettings);

// Activity logs (audit trail)
router.get('/activity', authorize('SUPER_ADMIN', 'ADMIN'), getActivityLogs);

// Admin accounts - super admin territory
router.get('/users', authorize('SUPER_ADMIN', 'ADMIN'), getAdmins);
router.post(
  '/users',
  superAdminOnly,
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Enter a name.'),
    body('email').isEmail().withMessage('Enter a valid email address.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
  ],
  validate,
  createAdmin
);
router.put('/users/:id', superAdminOnly, updateAdmin);
router.delete('/users/:id', superAdminOnly, deleteAdmin);

module.exports = router;

const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const {
  submitContact, submitConsultation, getLeads, getLead,
  createLead, updateLead, addNote, deleteLead, exportLeads
} = require('../controllers/leadController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 12,
  message: { success: false, message: 'Too many submissions from this network. Please try again later.' }
});

const contactRules = [
  body('name').trim().isLength({ min: 2 }).withMessage('Enter your name.'),
  body('email').isEmail().withMessage('Enter a valid email address.'),
  body('message').trim().isLength({ min: 5 }).withMessage('Tell us briefly what you need.')
];

// Public
router.post('/contact', formLimiter, contactRules, validate, submitContact);
router.post(
  '/consultation',
  formLimiter,
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Enter your name.'),
    body('email').isEmail().withMessage('Enter a valid email address.'),
    body('serviceRequired').trim().notEmpty().withMessage('Select the service you need.')
  ],
  validate,
  submitConsultation
);

// Admin
router.use(protect);
router.get('/export', authorize('SUPER_ADMIN', 'ADMIN'), exportLeads);
router.route('/').get(getLeads).post(authorize('SUPER_ADMIN', 'ADMIN', 'PROJECT_MANAGER'), createLead);
router.post('/:id/notes', addNote);
router.route('/:id')
  .get(getLead)
  .put(authorize('SUPER_ADMIN', 'ADMIN', 'PROJECT_MANAGER'), updateLead)
  .delete(authorize('SUPER_ADMIN', 'ADMIN'), deleteLead);

module.exports = router;

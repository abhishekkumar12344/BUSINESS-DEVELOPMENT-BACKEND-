const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const { login, getMe, logout, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Brute-force protection on the sign in route only.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many sign in attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

router.post(
  '/login',
  loginLimiter,
  [body('email').isEmail().withMessage('Enter a valid email address.'), body('password').notEmpty().withMessage('Enter your password.')],
  validate,
  login
);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/profile', protect, updateProfile);

module.exports = router;

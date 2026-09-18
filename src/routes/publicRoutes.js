const express = require('express');
const { getSettings } = require('../controllers/settingsController');

const router = express.Router();

// Settings the public site needs (contact details, hero copy, SEO).
router.get('/settings', getSettings);

module.exports = router;

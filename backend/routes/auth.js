const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Login Route
router.post('/login', authController.login);

// Logout Route
router.post('/logout', protect, authController.logout);

// Status Route
router.get('/status', protect, authController.getStatus);

// Seed Route (Temporary for setup)
router.post('/seed', authController.seed);

module.exports = router;

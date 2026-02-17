const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

// Register Route
router.post('/register', authController.register);

// Login Route
router.post('/login', authController.login);

// Logout Route
router.post('/logout', authController.logout);

// Status Route
router.get('/status', optionalProtect, authController.getStatus);

// Seed Route (Temporary for setup)
router.post('/seed', authController.seed);

// Reset Admin Route (Temporary)
router.post('/reset-admin', authController.resetAdmin);

module.exports = router;

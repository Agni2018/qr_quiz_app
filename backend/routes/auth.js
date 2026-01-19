const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login Route
router.post('/login', authController.login);

// Logout Route
router.post('/logout', authController.logout);

// Seed Route (Temporary for setup)
router.post('/seed', authController.seed);

module.exports = router;

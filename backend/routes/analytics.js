const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// GET analytics overview
router.get('/overview', protect, analyticsController.getOverview);

module.exports = router;

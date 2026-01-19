const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// GET analytics overview
router.get('/overview', analyticsController.getOverview);

module.exports = router;

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// GET analytics overview
router.get('/overview', protect, analyticsController.getOverview);

// GET global leaderboard
router.get('/global-leaderboard', protect, analyticsController.getGlobalLeaderboard);

// GET referral leaderboard
router.get('/referral-leaderboard', protect, analyticsController.getReferralLeaderboard);

// GET topic participants
router.get('/topic/:topicId/participants', protect, analyticsController.getTopicParticipants);

module.exports = router;

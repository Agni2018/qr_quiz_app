const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const { protect } = require('../middleware/authMiddleware');

// Get recent activities for the logged in user
router.get('/', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const total = await Activity.countDocuments({ userId: req.user.id });
        const activities = await Activity.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({ activities, total });
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ message: 'Server error fetching activities' });
    }
});

module.exports = router;

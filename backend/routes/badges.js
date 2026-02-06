const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, badgeController.getBadges);
router.get('/my-badges', protect, badgeController.getMyBadges);
router.post('/', protect, admin, badgeController.createBadge);
router.put('/:id', protect, admin, badgeController.updateBadge);
router.delete('/:id', protect, admin, badgeController.deleteBadge);

module.exports = router;

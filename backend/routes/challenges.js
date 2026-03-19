const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const { protect } = require('../middleware/authMiddleware');

router.get('/my', protect, challengeController.getMyChallenges);
router.get('/', protect, challengeController.getAllChallenges);
router.post('/', protect, challengeController.createChallenge);
router.delete('/:id', protect, challengeController.deleteChallenge);
router.post('/seed', challengeController.seedChallenges);

module.exports = router;

const express = require('express');
const router = express.Router();
const topicsController = require('../controllers/topicsController');
const { protect } = require('../middleware/authMiddleware');

// GET all topics
router.get('/', topicsController.getAllTopics);

// GET single topic
router.get('/:id', topicsController.getTopicById);

// POST create topic
router.post('/', protect, topicsController.createTopic);

// POST copy topic
router.post('/:id/copy', protect, topicsController.copyTopic);

// PUT update topic
router.put('/:id', protect, topicsController.updateTopic);

// DELETE topic
router.delete('/:id', protect, topicsController.deleteTopic);

module.exports = router;

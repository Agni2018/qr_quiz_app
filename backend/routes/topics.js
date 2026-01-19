const express = require('express');
const router = express.Router();
const topicsController = require('../controllers/topicsController');

// GET all topics
router.get('/', topicsController.getAllTopics);

// GET single topic
router.get('/:id', topicsController.getTopicById);

// POST create topic
router.post('/', topicsController.createTopic);

// PUT update topic
router.put('/:id', topicsController.updateTopic);

// DELETE topic
router.delete('/:id', topicsController.deleteTopic);

module.exports = router;

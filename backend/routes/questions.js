const express = require('express');
const router = express.Router();
const questionsController = require('../controllers/questionsController');

// GET questions for a topic
router.get('/topic/:topicId', questionsController.getQuestionsByTopic);

// POST create question
router.post('/', questionsController.createQuestion);

// PUT update question
router.put('/:id', questionsController.updateQuestion);

// DELETE question
router.delete('/:id', questionsController.deleteQuestion);

module.exports = router;

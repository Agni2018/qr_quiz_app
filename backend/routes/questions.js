const express = require('express');
const router = express.Router();
const questionsController = require('../controllers/questionsController');
const { protect } = require('../middleware/authMiddleware');

// GET questions for a topic
router.get('/topic/:topicId', questionsController.getQuestionsByTopic);

// GET reusable questions
router.get('/reusable', questionsController.getReusableQuestions);

// POST create question
router.post('/', protect, questionsController.createQuestion);

// PUT update question
router.put('/:id', protect, questionsController.updateQuestion);

// DELETE question
router.delete('/:id', protect, questionsController.deleteQuestion);

module.exports = router;

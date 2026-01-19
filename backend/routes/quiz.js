const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// Check eligibility to start quiz
router.post('/start', quizController.startQuiz);

// Submit Quiz
router.post('/submit', quizController.submitQuiz);

// Get Result
router.get('/result/:attemptId', quizController.getResult);

// Leaderboard
router.get('/leaderboard/:topicId', quizController.getLeaderboard);

module.exports = router;

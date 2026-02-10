const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

// Student Attempts
router.get('/student-attempts', protect, quizController.getStudentAttempts);

// Check eligibility to start quiz
router.post('/start', quizController.startQuiz);

// Submit Quiz
router.post('/submit', quizController.submitQuiz);

// Get Result
router.get('/result/:attemptId', quizController.getResult);

// Leaderboard
router.get('/leaderboard/:topicId', quizController.getLeaderboard);

// Certify Students (Admin Only - though protect middleware should ideally check role, for now it matches the other admin-ish routes)
router.post('/certify/:topicId', protect, quizController.certifyStudents);

// My Certificates (Student)
router.get('/my-certificates', protect, quizController.getStudentCertificates);

module.exports = router;

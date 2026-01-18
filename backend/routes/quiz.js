const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');
const Question = require('../models/Question');
const UserAttempt = require('../models/UserAttempt');

// Check eligibility to start quiz
router.post('/start', async (req, res) => {
    const { topicId, name, email, phone } = req.body;

    if (!topicId || !email || !phone || !name) {
        return res.status(400).json({ message: 'Missing details' });
    }

    try {
        const topic = await Topic.findById(topicId);
        if (!topic || topic.status !== 'active') {
            return res.status(404).json({ message: 'Quiz not active or found' });
        }

        // 🔴 UPDATED LOGIC: email OR phone
        const existingAttempt = await UserAttempt.findOne({
            topicId,
            $or: [
                { "user.email": email },
                { "user.phone": phone }
            ]
        });

        if (existingAttempt) {
            return res.status(403).json({
                message: 'You have already attempted this quiz.',
                attemptId: existingAttempt._id
            });
        }

        res.json({ message: 'Access granted', canAttempt: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Submit Quiz
router.post('/submit', async (req, res) => {
    const { topicId, user, answers } = req.body;

    if (!topicId || !user || !answers) {
        return res.status(400).json({ message: 'Invalid submission data' });
    }

    try {
        // 🔴 UPDATED LOGIC: email OR phone
        const existingAttempt = await UserAttempt.findOne({
            topicId,
            $or: [
                { "user.email": user.email },
                { "user.phone": user.phone }
            ]
        });

        if (existingAttempt) {
            return res.status(400).json({ message: 'Duplicate submission detected' });
        }

        const questions = await Question.find({ topicId });
        let totalScore = 0;
        const processedAnswers = [];

        // Scoring Logic
        for (let ans of answers) {
            const question = questions.find(q => q._id.toString() === ans.questionId);
            if (!question) continue;

            let valid = false;
            const qType = question.type;
            const correct = question.correctAnswer;
            const submitted = ans.submittedAnswer;

            if (qType === 'true_false' || qType === 'single_choice' || qType === 'fill_blank') {
                if (String(submitted).trim().toLowerCase() === String(correct).trim().toLowerCase()) {
                    valid = true;
                }
            } else if (qType === 'multi_select') {
                if (Array.isArray(submitted) && Array.isArray(correct)) {
                    const s = [...submitted].sort();
                    const c = [...correct].sort();
                    valid = JSON.stringify(s) === JSON.stringify(c);
                }
            } else if (qType === 'match' || qType === 'reorder' || qType === 'sort') {
                valid = JSON.stringify(submitted) === JSON.stringify(correct);
            }

            const marks = valid ? question.marks : 0;
            totalScore += marks;

            processedAnswers.push({
                questionId: question._id,
                submittedAnswer: submitted,
                isCorrect: valid,
                marksObtained: marks
            });
        }

        const attempt = new UserAttempt({
            topicId,
            user,
            answers: processedAnswers,
            score: totalScore
        });

        await attempt.save();

        res.json({
            message: 'Quiz submitted successfully',
            score: totalScore,
            attemptId: attempt._id
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Result
router.get('/result/:attemptId', async (req, res) => {
    try {
        const attempt = await UserAttempt.findById(req.params.attemptId)
            .populate('topicId', 'name');
        if (!attempt) return res.status(404).json({ message: 'Result not found' });
        res.json(attempt);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Leaderboard
router.get('/leaderboard/:topicId', async (req, res) => {
    try {
        const attempts = await UserAttempt.find({ topicId: req.params.topicId })
            .sort({ score: -1, completedAt: 1 })
            .limit(20)
            .select('user.name score completedAt');

        res.json(attempts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

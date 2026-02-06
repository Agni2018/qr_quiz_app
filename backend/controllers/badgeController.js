const Badge = require('../models/Badge');
const User = require('../models/User');
const UserAttempt = require('../models/UserAttempt');
const Question = require('../models/Question');

exports.getBadges = async (req, res) => {
    try {
        const badges = await Badge.find();
        res.json(badges);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createBadge = async (req, res) => {
    const { name, description, icon, type, threshold } = req.body;

    if (!name || !description || !type || threshold === undefined) {
        return res.status(400).json({ message: 'Missing required fields: name, description, type, and threshold are required.' });
    }

    const badge = new Badge({ name, description, icon, type, threshold });
    try {
        const newBadge = await badge.save();
        res.status(201).json(newBadge);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateBadge = async (req, res) => {
    try {
        const badge = await Badge.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(badge);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteBadge = async (req, res) => {
    try {
        await Badge.findByIdAndDelete(req.params.id);
        res.json({ message: 'Badge deleted' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getMyBadges = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 1. Get all badge definitions
        const allBadges = await Badge.find();

        // 2. Gather user stats
        // Points and Streak are directly on the user object
        const points = user.points || 0;
        const streak = user.loginStreak || 0;

        // Referrals
        const referrals = await User.countDocuments({ referredBy: userId });

        // Perfect Quizzes
        const attempts = await UserAttempt.find({ userId }).populate('topicId');
        let perfectQuizzes = 0;

        for (const attempt of attempts) {
            if (!attempt.topicId) continue;
            const questions = await Question.find({ topicId: attempt.topicId._id });
            const maxScore = questions.reduce((sum, q) => sum + (q.marks || 1), 0);

            // rawScore logic from quizController uses isCorrect field or marks
            // Let's use isCorrect to check if all questions were answered correctly
            const isPerfect = attempt.answers.length > 0 &&
                attempt.answers.length === questions.length &&
                attempt.answers.every(ans => ans.isCorrect);

            if (isPerfect) perfectQuizzes++;
        }

        // 3. Evaluate badges
        const earnedBadges = allBadges.filter(badge => {
            switch (badge.type) {
                case 'points':
                    return points >= badge.threshold;
                case 'streak':
                    return streak >= badge.threshold;
                case 'referral':
                    return referrals >= badge.threshold;
                case 'quiz_perfect':
                    return perfectQuizzes >= badge.threshold;
                default:
                    return false;
            }
        });

        res.json(earnedBadges);
    } catch (err) {
        console.error('Error fetching earned badges:', err);
        res.status(500).json({ message: err.message });
    }
};

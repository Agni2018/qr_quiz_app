const Topic = require('../models/Topic');
const UserAttempt = require('../models/UserAttempt');
const User = require('../models/User');

// GET analytics overview
exports.getOverview = async (req, res) => {
    try {
        const totalTopics = await Topic.countDocuments();
        const activeTopics = await Topic.countDocuments({ status: 'active' });

        const topicStats = await UserAttempt.aggregate([
            {
                $group: {
                    _id: '$topicId',
                    participantCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'topics',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'topicInfo'
                }
            },
            {
                $unwind: '$topicInfo'
            },
            {
                $project: {
                    topicId: '$_id',
                    topicName: '$topicInfo.name',
                    participantCount: 1,
                    _id: 0
                }
            },
            {
                $sort: { participantCount: -1 }
            }
        ]);

        res.json({
            totalTopics,
            activeTopics,
            topicStats
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET global leaderboard
exports.getGlobalLeaderboard = async (req, res) => {
    try {
        const topScorers = await User.find({ role: 'student' })
            .sort({ points: -1 })
            .limit(10)
            .select('username points loginStreak badges');

        // Referrals leaderboard
        const referralStats = await User.aggregate([
            { $match: { role: 'student' } },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'referredBy',
                    as: 'referrals'
                }
            },
            {
                $project: {
                    username: 1,
                    referralCount: { $size: '$referrals' }
                }
            },
            { $sort: { referralCount: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            topScorers,
            referralStats
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET participants for a specific topic
exports.getTopicParticipants = async (req, res) => {
    try {
        const { topicId } = req.params;

        // Find all attempts for this topic
        const attempts = await UserAttempt.find({ topicId })
            .select('userId user score completedAt answers isCertified')
            .sort({ score: -1, completedAt: 1 });

        const Topic = require('../models/Topic');
        const topic = await Topic.findById(topicId);
        const passingMarks = topic?.passingMarks || 0;

        const participants = attempts.map(attempt => ({
            id: attempt._id,
            userId: attempt.userId,
            name: attempt.user.name,
            email: attempt.user.email,
            phone: attempt.user.phone,
            score: attempt.score,
            completedAt: attempt.completedAt,
            answersCount: attempt.answers?.length || 0,
            correctAnswersCount: attempt.answers?.filter(a => a.isCorrect).length || 0,
            isCertified: attempt.isCertified || false,
            isQualified: (topic?.passingMarks > 0)
                ? (attempt.score >= topic.passingMarks)
                : (attempt.answers?.filter(a => a.isCorrect).length > 0)
        }));

        res.json({
            participants,
            passingMarks
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

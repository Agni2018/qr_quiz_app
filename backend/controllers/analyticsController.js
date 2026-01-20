const Topic = require('../models/Topic');
const UserAttempt = require('../models/UserAttempt');

// GET analytics overview
exports.getOverview = async (req, res) => {
    try {
        // Get total topics count
        const totalTopics = await Topic.countDocuments();
        const activeTopics = await Topic.countDocuments({ status: 'active' });

        // Aggregate user attempts by topic
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

const mongoose = require('mongoose');
const Topic = require('./models/Topic');
const UserAttempt = require('./models/UserAttempt');
require('dotenv').config();

async function runAgg() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const topicStats = await UserAttempt.aggregate([
            {
                $lookup: {
                    from: 'topics',
                    localField: 'topicId',
                    foreignField: '_id',
                    as: 'topic'
                }
            },
            { $unwind: '$topic' },
            {
                $project: {
                    topicId: 1,
                    isCertified: 1,
                    score: 1,
                    passingMarks: { $ifNull: ['$topic.passingMarks', 0] },
                    topicName: '$topic.name',
                    categoryId: '$topic.categoryId'
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $group: {
                    _id: '$topicId',
                    topicName: { $first: '$topicName' },
                    categoryName: { $first: { $arrayElemAt: ['$category.name', 0] } },
                    participantCount: { $sum: 1 },
                    pendingCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $ne: ['$isCertified', true] },
                                        { $gte: ['$score', '$passingMarks'] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);
        console.log(JSON.stringify(topicStats, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
runAgg();

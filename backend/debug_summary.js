const mongoose = require('mongoose');
const Topic = require('./models/Topic');
const UserAttempt = require('./models/UserAttempt');
require('dotenv').config();

async function debugPending() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const targetTopic = await Topic.findOne({ name: /Civics/i });
        if (!targetTopic) {
            console.log('Civics not found');
            process.exit(0);
        }
        const attempts = await UserAttempt.find({ topicId: targetTopic._id });
        const res = {
            name: targetTopic.name,
            passing: targetTopic.passingMarks,
            total: attempts.length,
            certified: attempts.filter(a => a.isCertified === true).length,
            eligible: attempts.filter(a => a.score >= targetTopic.passingMarks).length,
            pending: attempts.filter(a => a.isCertified !== true && a.score >= targetTopic.passingMarks).length
        };
        console.log('SUMMARY_START');
        console.log(JSON.stringify(res, null, 2));
        console.log('SUMMARY_END');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
debugPending();

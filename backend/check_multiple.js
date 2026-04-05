const mongoose = require('mongoose');
const Topic = require('./models/Topic');
const UserAttempt = require('./models/UserAttempt');
require('dotenv').config();

async function checkMultipleTopics() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const topics = await Topic.find({ name: /Civics/i });
        console.log(`Found ${topics.length} topics matching Civics`);
        for (const t of topics) {
            const count = await UserAttempt.countDocuments({ topicId: t._id });
            const pending = await UserAttempt.countDocuments({ topicId: t._id, isCertified: { $ne: true }, score: { $gte: t.passingMarks } });
            console.log(`- ${t.name} (ID: ${t._id}), Passing: ${t.passingMarks}, Total: ${count}, Pending: ${pending}`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkMultipleTopics();

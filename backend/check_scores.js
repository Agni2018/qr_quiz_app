const mongoose = require('mongoose');
const Topic = require('./models/Topic');
const UserAttempt = require('./models/UserAttempt');
require('dotenv').config();

async function checkCivicsScores() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const t = await Topic.findOne({ name: /Civics/i });
        console.log(`Topic: ${t.name}, Passing: ${t.passingMarks}`);
        const attempts = await UserAttempt.find({ topicId: t._id });
        const summary = attempts.map(a => ({
            name: a.user.name,
            score: a.score,
            isCertified: a.isCertified
        }));
        console.log('SCORES_START');
        console.log(JSON.stringify(summary, null, 2));
        console.log('SCORES_END');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkCivicsScores();

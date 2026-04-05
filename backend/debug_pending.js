const mongoose = require('mongoose');
const Topic = require('./models/Topic');
const UserAttempt = require('./models/UserAttempt');
require('dotenv').config();

async function debugPending() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const targetTopic = await Topic.findOne({ name: /Civics/i });
        if (!targetTopic) {
            console.log('Civics topic not found');
            process.exit(0);
        }
        
        console.log(`Topic: ${targetTopic.name} (ID: ${targetTopic._id})`);
        console.log(`Passing Marks: ${targetTopic.passingMarks}`);
        
        const attempts = await UserAttempt.find({ topicId: targetTopic._id });
        console.log(`Total attempts for Civics: ${attempts.length}`);
        
        const certified = attempts.filter(a => a.isCertified === true);
        const uncertified = attempts.filter(a => a.isCertified !== true);
        const eligible = attempts.filter(a => a.score >= targetTopic.passingMarks);
        const eligibleUncertified = attempts.filter(a => a.isCertified !== true && a.score >= targetTopic.passingMarks);
        
        console.log(`Certified: ${certified.length}`);
        console.log(`Uncertified: ${uncertified.length}`);
        console.log(`Eligible (score >= passing): ${eligible.length}`);
        console.log(`Eligible & Uncertified: ${eligibleUncertified.length}`);
        
        if (eligibleUncertified.length > 0) {
            console.log('Sample eligible uncertified:', JSON.stringify(eligibleUncertified[0], null, 2));
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
debugPending();

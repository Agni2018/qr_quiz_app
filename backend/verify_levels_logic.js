const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const user = await User.findOne({ username: 'admin' });
        if (!user) {
            console.log('Admin user not found');
            process.exit(1);
        }

        console.log(`Current User: ${user.username}, Points: ${user.points}, LastSeenLevel: ${user.lastSeenLevel}`);

        // Test Level Calculation
        const calculateLevel = (pts) => Math.min(Math.floor((pts || 0) / 50) + 1, 11);

        // Case 1: No change
        user.points = 45;
        user.lastSeenLevel = 1;
        let currentLevel = calculateLevel(user.points);
        console.log(`Points 45 -> Level ${currentLevel}. LevelUp: ${currentLevel > user.lastSeenLevel}`);

        // Case 2: Level Up
        user.points = 55;
        currentLevel = calculateLevel(user.points);
        console.log(`Points 55 -> Level ${currentLevel}. LevelUp: ${currentLevel > user.lastSeenLevel}`);

        // Case 3: Max Level
        user.points = 550;
        currentLevel = calculateLevel(user.points);
        console.log(`Points 550 -> Level ${currentLevel}. LevelUp: ${currentLevel > (user.lastSeenLevel || 1)}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();

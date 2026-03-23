const axios = require('axios');

async function testStatus() {
    try {
        // Since we are server-side, we can't easily get the cookie.
        // I'll use the DB to check what would be returned.
        const mongoose = require('mongoose');
        const User = require('./models/User');
        require('dotenv').config();
        await mongoose.connect(process.env.MONGODB_URI);

        const user = await User.findOne({ username: 'admin' });
        console.log(`Initial: Points ${user.points}, LastSeenLevel ${user.lastSeenLevel}`);

        const currentLevel = Math.min(Math.floor((user.points || 0) / 50) + 1, 11);
        let levelUp = null;
        const lastSeen = user.lastSeenLevel || 1;
        if (currentLevel > lastSeen) {
            levelUp = { old: lastSeen, new: currentLevel };
            console.log('Would Level Up:', levelUp);
        } else {
            console.log('No Level Up');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
testStatus();

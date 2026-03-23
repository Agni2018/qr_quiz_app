const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function trigger() {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ username: 'david t' });
    if (user) {
        user.points = 55;
        user.lastSeenLevel = 1;
        await user.save();
        console.log(`Updated david t to 55 points, lastSeenLevel 1`);
    } else {
        console.log('david t not found');
    }
    process.exit(0);
}
trigger();

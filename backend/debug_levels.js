const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({});
    users.forEach(u => {
        console.log(`User: ${u.username}, Points: ${u.points}, LastSeenLevel: ${u.lastSeenLevel}`);
    });
    process.exit(0);
}
check();

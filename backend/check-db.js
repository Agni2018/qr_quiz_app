const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ username: 'admin' });
        if (user) {
            console.log('User found:', user.username);
            console.log('Password length:', user.password.length);
            console.log('Password starts with $2:', user.password.startsWith('$2')); // bcrypt hashes start with $2a or $2b
        } else {
            console.log('User not found');
        }
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkUser();

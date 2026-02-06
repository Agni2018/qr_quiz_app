const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const UserAttempt = require('../models/UserAttempt');

dotenv.config();

const syncPoints = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find();
        console.log(`Found ${users.length} users. Starting sync...`);

        for (const user of users) {
            // 1. Count attempts (Unify by ID, email, or username)
            const attemptCount = await UserAttempt.countDocuments({
                $or: [
                    { userId: user._id },
                    { "user.email": user.email },
                    { "user.name": user.username }
                ]
            });

            // 2. Calculate referral bonuses
            let referralBonus = 0;
            if (user.referredBy) {
                referralBonus += 20; // Bonus for being referred
            }

            const referredCount = await User.countDocuments({ referredBy: user._id });
            referralBonus += (referredCount * 50); // Bonus for referring others

            // 3. Set points: 5 (base) + 1 per attempt + referral bonuses
            // Note: This reset specifically aligns with the new +1 per quiz rule.
            const newPoints = 5 + attemptCount + referralBonus;

            console.log(`User: ${user.username} | Attempts: ${attemptCount} | Ref Bonus: ${referralBonus} | Old: ${user.points} | New: ${newPoints}`);

            user.points = newPoints;
            await user.save();
        }

        console.log('Synchronization complete!');
        process.exit(0);
    } catch (err) {
        console.error('Error syncing points:', err);
        process.exit(1);
    }
};

syncPoints();

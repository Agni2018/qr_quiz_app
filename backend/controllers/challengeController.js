const Challenge = require('../models/Challenge');
const UserChallenge = require('../models/UserChallenge');
const User = require('../models/User');
const Message = require('../models/Message');

// Get My Challenges
exports.getMyChallenges = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();

        // 1. Get all active challenges
        const activeChallenges = await Challenge.find({
            startDate: { $lte: now },
            endDate: { $gte: now }
        });

        // 2. Get or create progress for each challenge
        const challengesWithProgress = await Promise.all(activeChallenges.map(async (challenge) => {
            let progress = await UserChallenge.findOne({ userId, challengeId: challenge._id });
            
            if (!progress) {
                progress = new UserChallenge({ userId, challengeId: challenge._id });
                await progress.save();
            }

            return {
                ...challenge.toObject(),
                currentValue: progress.currentValue,
                isCompleted: progress.isCompleted,
                isRewarded: progress.isRewarded
            };
        }));

        res.json(challengesWithProgress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get All Challenges (Admin)
exports.getAllChallenges = async (req, res) => {
    try {
        const challenges = await Challenge.find().sort({ createdAt: -1 });
        res.json(challenges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create Challenge (Admin)
exports.createChallenge = async (req, res) => {
    try {
        const { name, description, type, threshold, rewardPoints, startDate, endDate } = req.body;
        const challenge = new Challenge({
            name,
            description,
            type,
            threshold,
            rewardPoints,
            startDate,
            endDate
        });
        await challenge.save();
        res.status(201).json(challenge);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Challenge (Admin)
exports.deleteChallenge = async (req, res) => {
    try {
        await Challenge.findByIdAndDelete(req.params.id);
        // Also delete user progress for this challenge
        await UserChallenge.deleteMany({ challengeId: req.params.id });
        res.json({ message: 'Challenge deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Internal Helper to update progress
exports.updateProgress = async (userId, type, increment = 1) => {
    try {
        const now = new Date();
        const activeChallenges = await Challenge.find({
            type,
            startDate: { $lte: now },
            endDate: { $gte: now }
        });

        for (const challenge of activeChallenges) {
            let progress = await UserChallenge.findOne({ userId, challengeId: challenge._id });
            
            if (!progress) {
                progress = new UserChallenge({ userId, challengeId: challenge._id });
            }

            if (progress.isCompleted) continue;

            progress.currentValue += increment;

            if (progress.currentValue >= challenge.threshold) {
                progress.isCompleted = true;
                progress.completedAt = new Date();

                // Award points if not already rewarded
                if (!progress.isRewarded) {
                    const user = await User.findById(userId);
                    if (user) {
                        user.points += challenge.rewardPoints;
                        await user.save();
                        progress.isRewarded = true;

                        // Create a notification message
                        try {
                            const message = new Message({
                                sender: userId, // Self-sent or system-sent
                                recipient: userId,
                                text: `Congratulations! You've completed the weekly challenge: ${challenge.name} and earned ${challenge.rewardPoints} points!`
                            });
                            await message.save();
                        } catch (msgErr) {
                            console.error('Error saving challenge message:', msgErr);
                        }
                        progress.isRewarded = true;
                    }
                }
            }

            await progress.save();
        }
    } catch (error) {
        console.error('Error updating challenge progress:', error);
    }
};

// Seed Challenges (Helper for setup)
exports.seedChallenges = async (req, res) => {
    try {
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const challenges = [
            {
                name: "Quiz Enthusiast",
                description: "Complete 5 quizzes this week",
                type: "quiz_count",
                threshold: 5,
                rewardPoints: 20,
                startDate: now,
                endDate: nextWeek
            },
            {
                name: "Points Collector",
                description: "Earn 10 points this week",
                type: "points_earned",
                threshold: 10,
                rewardPoints: 15,
                startDate: now,
                endDate: nextWeek
            },
            {
                name: "The Recruiter",
                description: "Refer 1 friend this week",
                type: "referral_count",
                threshold: 1,
                rewardPoints: 25,
                startDate: now,
                endDate: nextWeek
            }
        ];

        await Challenge.deleteMany({}); // Clear existing
        await Challenge.insertMany(challenges);
        
        res.json({ message: "Challenges seeded successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

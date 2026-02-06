const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String }, // URL or icon name
    type: {
        type: String,
        enum: ['points', 'streak', 'referral', 'quiz_perfect', 'other'],
        required: true
    },
    threshold: { type: Number, required: true }, // e.g., 5 quizzes, 7 days streak, 10 referrals
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Badge', badgeSchema);

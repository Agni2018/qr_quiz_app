const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: {
        type: String,
        enum: ['quiz_count', 'points_earned', 'perfect_score', 'referral_count', 'streak'],
        required: true
    },
    threshold: { type: Number, required: true },
    rewardPoints: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema);

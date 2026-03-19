const mongoose = require('mongoose');

const userChallengeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
    currentValue: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    isRewarded: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('UserChallenge', userChallengeSchema);

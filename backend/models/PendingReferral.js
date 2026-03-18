const mongoose = require('mongoose');

const pendingReferralSchema = new mongoose.Schema({
    referrerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetUsername: {
        type: String,
        required: true,
        trim: true
    },
    targetEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    referralCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('PendingReferral', pendingReferralSchema);

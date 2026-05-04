const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    role: {
        type: String,
        required: true,
        enum: ['student', 'admin']
    },
    actionTitle: {
        type: String,
        required: true
    },
    actionDescription: {
        type: String
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: '10d' } // Automatic cleanup after 10 days
    }
});

module.exports = mongoose.model('Activity', activitySchema);

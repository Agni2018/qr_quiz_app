const mongoose = require('mongoose');

const userAttemptSchema = new mongoose.Schema({
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    user: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true }
    },
    answers: [{
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        submittedAnswer: { type: mongoose.Schema.Types.Mixed },
        isCorrect: { type: Boolean },
        marksObtained: { type: Number }
    }],
    score: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now }
});

// Ensure unique attempt per user per topic
userAttemptSchema.index({ topicId: 1, "user.email": 1, "user.phone": 1 }, { unique: true });

module.exports = mongoose.model('UserAttempt', userAttemptSchema);

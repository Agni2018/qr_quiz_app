const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    timeLimit: { type: Number, default: 0 }, // In seconds, 0 means no limit
    negativeMarking: { type: Number, default: 0 }, // Value to subtract for wrong answers
    timeBasedScoring: { type: Boolean, default: false }, // Bonus for fast completion
    passingMarks: { type: Number, default: 0 }, // Threshold for certification
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Topic', topicSchema);

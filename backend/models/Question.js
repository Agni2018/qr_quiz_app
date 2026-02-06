const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }, // Optional for reusable questions
    isReusable: { type: Boolean, default: false },
    type: {
        type: String,
        enum: ['fill_blank', 'match', 'true_false', 'multi_select', 'single_choice', 'reorder', 'sort'],
        required: true
    },
    content: {
        text: { type: String },
        mediaUrl: { type: String },
        mediaType: { type: String, enum: ['image', 'audio', 'none'], default: 'none' }
    },
    options: [{ type: mongoose.Schema.Types.Mixed }], // Array of strings or objects depending on type
    correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true }, // Can be string, array, or object
    marks: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', questionSchema);

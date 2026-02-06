const Question = require('../models/Question');

// GET questions for a topic
exports.getQuestionsByTopic = async (req, res) => {
    try {
        const questions = await Question.find({ topicId: req.params.topicId });
        res.json(questions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET reusable questions
exports.getReusableQuestions = async (req, res) => {
    try {
        const questions = await Question.find({ isReusable: true });
        res.json(questions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST create question
exports.createQuestion = async (req, res) => {
    const { topicId, type, content, options, correctAnswer, marks, isReusable } = req.body;

    if ((!topicId && !isReusable) || !type || !correctAnswer) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const question = new Question({
            topicId: topicId || null,
            type,
            content,
            options,
            correctAnswer,
            marks,
            isReusable: isReusable || false
        });

        const newQuestion = await question.save();
        res.status(201).json(newQuestion);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// PUT update question
exports.updateQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ message: 'Question not found' });

        Object.assign(question, req.body);

        const updatedQuestion = await question.save();
        res.json(updatedQuestion);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE question
exports.deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ message: 'Question not found' });

        await question.deleteOne();
        res.json({ message: 'Question deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

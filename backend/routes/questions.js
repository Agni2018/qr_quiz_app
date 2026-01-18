const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// GET questions for a topic
router.get('/topic/:topicId', async (req, res) => {
    try {
        const questions = await Question.find({ topicId: req.params.topicId });
        res.json(questions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create question
router.post('/', async (req, res) => {
    const { topicId, type, content, options, correctAnswer, marks } = req.body;

    if (!topicId || !type || !correctAnswer) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const question = new Question({
        topicId,
        type,
        content,
        options,
        correctAnswer,
        marks
    });

    try {
        const newQuestion = await question.save();
        res.status(201).json(newQuestion);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update question
router.put('/:id', async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ message: 'Question not found' });

        Object.assign(question, req.body);

        const updatedQuestion = await question.save();
        res.json(updatedQuestion);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE question
router.delete('/:id', async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ message: 'Question not found' });

        await question.deleteOne();
        res.json({ message: 'Question deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

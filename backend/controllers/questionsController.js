const Question = require('../models/Question');
const Activity = require('../models/Activity');
const Topic = require('../models/Topic');

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

        if (newQuestion.isReusable) {
            Activity.create({
                userId: req.user.id,
                role: 'admin',
                actionTitle: 'Reusable Question Added',
                actionDescription: `Added a reusable question to the question bank`,
                metadata: { questionId: newQuestion._id }
            }).catch(err => console.error('Activity log error:', err));
        } else if (newQuestion.topicId) {
            try {
                const topic = await Topic.findById(newQuestion.topicId);
                if (topic) {
                    const truncatedContent = newQuestion.content.length > 40 ? newQuestion.content.substring(0, 40) + '...' : newQuestion.content;
                    Activity.create({
                        userId: req.user.id,
                        role: 'admin',
                        actionTitle: 'Question Added',
                        actionDescription: `Added question "${truncatedContent}" in topic "${topic.name}"`,
                        metadata: { questionId: newQuestion._id, topicId: topic._id }
                    }).catch(err => console.error('Activity log error:', err));
                }
            } catch (err) {
                console.error('Topic fetch error for activity log:', err);
            }
        }

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

        if (updatedQuestion.isReusable) {
            Activity.create({
                userId: req.user.id,
                role: 'admin',
                actionTitle: 'Reusable Question Updated',
                actionDescription: `Updated a reusable question in the question bank`,
                metadata: { questionId: updatedQuestion._id }
            }).catch(err => console.error('Activity log error:', err));
        } else if (updatedQuestion.topicId) {
            try {
                const topic = await Topic.findById(updatedQuestion.topicId);
                if (topic) {
                    const truncatedContent = updatedQuestion.content.length > 40 ? updatedQuestion.content.substring(0, 40) + '...' : updatedQuestion.content;
                    Activity.create({
                        userId: req.user.id,
                        role: 'admin',
                        actionTitle: 'Question Updated',
                        actionDescription: `Updated question "${truncatedContent}" in topic "${topic.name}"`,
                        metadata: { questionId: updatedQuestion._id, topicId: topic._id }
                    }).catch(err => console.error('Activity log error:', err));
                }
            } catch (err) {
                console.error('Topic fetch error for activity log:', err);
            }
        }

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

        if (question.isReusable) {
            Activity.create({
                userId: req.user.id,
                role: 'admin',
                actionTitle: 'Reusable Question Deleted',
                actionDescription: `Deleted a reusable question from the question bank`,
                metadata: { questionId: question._id }
            }).catch(err => console.error('Activity log error:', err));
        } else if (question.topicId) {
            try {
                const topic = await Topic.findById(question.topicId);
                if (topic) {
                    const truncatedContent = question.content.length > 40 ? question.content.substring(0, 40) + '...' : question.content;
                    Activity.create({
                        userId: req.user.id,
                        role: 'admin',
                        actionTitle: 'Question Deleted',
                        actionDescription: `Deleted question "${truncatedContent}" from topic "${topic.name}"`,
                        metadata: { questionId: question._id, topicId: topic._id }
                    }).catch(err => console.error('Activity log error:', err));
                }
            } catch (err) {
                console.error('Topic fetch error for activity log:', err);
            }
        }

        res.json({ message: 'Question deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

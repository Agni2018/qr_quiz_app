const Topic = require('../models/Topic');
const Question = require('../models/Question');

// GET all topics
exports.getAllTopics = async (req, res) => {
    try {
        const topics = await Topic.find().sort({ createdAt: -1 });
        res.json(topics);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET single topic
exports.getTopicById = async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id);
        if (!topic) return res.status(404).json({ message: 'Topic not found' });
        res.json(topic);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST create topic
exports.createTopic = async (req, res) => {
    const { name, description, timeLimit, negativeMarking, timeBasedScoring } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const topic = new Topic({
        name,
        description,
        timeLimit: timeLimit || 0,
        negativeMarking: negativeMarking || 0,
        timeBasedScoring: timeBasedScoring || false
    });

    try {
        const newTopic = await topic.save();
        res.status(201).json(newTopic);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// PUT update topic
exports.updateTopic = async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id);
        if (!topic) return res.status(404).json({ message: 'Topic not found' });

        const fields = ['name', 'description', 'status', 'timeLimit', 'negativeMarking', 'timeBasedScoring'];
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                topic[field] = req.body[field];
            }
        });

        const updatedTopic = await topic.save();
        res.json(updatedTopic);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE topic
exports.deleteTopic = async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id);
        if (!topic) return res.status(404).json({ message: 'Topic not found' });

        await topic.deleteOne();
        res.json({ message: 'Topic deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST copy topic
exports.copyTopic = async (req, res) => {
    try {
        const sourceTopic = await Topic.findById(req.params.id);
        if (!sourceTopic) return res.status(404).json({ message: 'Topic not found' });

        // 1. Create new topic
        const newTopic = new Topic({
            name: `${sourceTopic.name} copy`,
            description: sourceTopic.description,
            status: 'active',
            timeLimit: sourceTopic.timeLimit,
            negativeMarking: sourceTopic.negativeMarking,
            timeBasedScoring: sourceTopic.timeBasedScoring
        });
        await newTopic.save();

        // 2. Find and duplicate questions
        const questions = await Question.find({ topicId: sourceTopic._id });

        if (questions.length > 0) {
            const newQuestions = questions.map(q => ({
                topicId: newTopic._id, // Link to new topic
                type: q.type,
                content: q.content,
                options: q.options,
                correctAnswer: q.correctAnswer,
                marks: q.marks
            }));
            await Question.insertMany(newQuestions);
        }

        res.status(201).json(newTopic);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

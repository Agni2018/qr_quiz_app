const Topic = require('../models/Topic');
const Question = require('../models/Question');
const Activity = require('../models/Activity');
const Category = require('../models/Category');

// GET all topics
exports.getAllTopics = async (req, res) => {
    try {
        const query = {};
        if (req.query.category === 'null') {
            query.$or = [{ categoryId: null }, { categoryId: { $exists: false } }];
        } else if (req.query.category) {
            query.categoryId = req.query.category;
        }
        const topics = await Topic.find(query)
            .populate('categoryId', 'name')
            .sort({ createdAt: -1 });

        // Add question count for each topic
        const topicsWithCount = await Promise.all(topics.map(async (topic) => {
            const count = await Question.countDocuments({ topicId: topic._id });
            return {
                ...topic.toObject(),
                questionCount: count
            };
        }));

        res.json(topicsWithCount);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET single topic
exports.getTopicById = async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id).populate('categoryId', 'name');
        if (!topic) return res.status(404).json({ message: 'Topic not found' });
        res.json(topic);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST create topic
exports.createTopic = async (req, res) => {
    const { name, description, timeLimit, negativeMarking, timeBasedScoring, passingMarks, categoryId } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const topic = new Topic({
        name,
        description,
        timeLimit: timeLimit || 0,
        negativeMarking: negativeMarking || 0,
        timeBasedScoring: timeBasedScoring || false,
        passingMarks: passingMarks || 0,
        categoryId: categoryId || null
    });

    try {
        const newTopic = await topic.save();
        
        let actionDesc = `Created new topic "${name}"`;
        if (categoryId) {
            try {
                const category = await Category.findById(categoryId);
                if (category) {
                    actionDesc = `Created new topic "${name}" at category "${category.name}"`;
                }
            } catch (err) {
                console.error(err);
            }
        }

        Activity.create({
            userId: req.user.id,
            role: 'admin',
            actionTitle: 'Topic Created',
            actionDescription: actionDesc,
            metadata: { topicId: newTopic._id }
        }).catch(err => console.error('Activity log error:', err));

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

        const fields = ['name', 'description', 'status', 'timeLimit', 'negativeMarking', 'timeBasedScoring', 'passingMarks'];
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                topic[field] = req.body[field];
            }
        });

        const updatedTopic = await topic.save();

        Activity.create({
            userId: req.user.id,
            role: 'admin',
            actionTitle: 'Topic Updated',
            actionDescription: `Updated topic "${updatedTopic.name}"`,
            metadata: { topicId: updatedTopic._id }
        }).catch(err => console.error('Activity log error:', err));

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

        Activity.create({
            userId: req.user.id,
            role: 'admin',
            actionTitle: 'Topic Deleted',
            actionDescription: `Deleted topic "${topic.name}"`,
            metadata: { topicId: topic._id }
        }).catch(err => console.error('Activity log error:', err));

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
            timeBasedScoring: sourceTopic.timeBasedScoring,
            passingMarks: sourceTopic.passingMarks,
            categoryId: sourceTopic.categoryId
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

        Activity.create({
            userId: req.user.id,
            role: 'admin',
            actionTitle: 'Topic Duplicated',
            actionDescription: `Duplicated topic "${sourceTopic.name}"`,
            metadata: { topicId: newTopic._id }
        }).catch(err => console.error('Activity log error:', err));

        res.status(201).json(newTopic);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

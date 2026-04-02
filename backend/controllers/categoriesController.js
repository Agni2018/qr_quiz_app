const Category = require('../models/Category');
const Topic = require('../models/Topic');
const Question = require('../models/Question');

// GET all categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST create category
exports.createCategory = async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const category = new Category({ name });

    try {
        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE category
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        // Nullify categoryId for all topics in this category
        await Topic.updateMany({ categoryId: req.params.id }, { $set: { categoryId: null } });
        
        await category.deleteOne();
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT update category
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        if (req.body.name) {
            category.name = req.body.name;
        }

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// POST copy category (duplicates category and all its topics)
exports.copyCategory = async (req, res) => {
    try {
        const sourceCategory = await Category.findById(req.params.id);
        if (!sourceCategory) return res.status(404).json({ message: 'Category not found' });

        // 1. Create new category
        const newCategory = new Category({
            name: `${sourceCategory.name} copy`
        });
        await newCategory.save();

        // 2. Find topics in this category
        const topics = await Topic.find({ categoryId: sourceCategory._id });

        for (const topic of topics) {
            // Duplicate topic
            const newTopic = new Topic({
                name: topic.name,
                description: topic.description,
                status: topic.status,
                timeLimit: topic.timeLimit,
                negativeMarking: topic.negativeMarking,
                timeBasedScoring: topic.timeBasedScoring,
                passingMarks: topic.passingMarks,
                categoryId: newCategory._id
            });
            await newTopic.save();

            // Duplicate questions for this topic
            const questions = await Question.find({ topicId: topic._id });
            if (questions.length > 0) {
                const newQuestions = questions.map(q => ({
                    topicId: newTopic._id,
                    type: q.type,
                    content: q.content,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    marks: q.marks
                }));
                await Question.insertMany(newQuestions);
            }
        }

        res.status(201).json(newCategory);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

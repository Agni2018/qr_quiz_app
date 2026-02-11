const StudyMaterial = require('../models/StudyMaterial');
const Topic = require('../models/Topic');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

exports.uploadMiddleware = upload.single('file');

exports.uploadMaterial = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { name, description, topicId } = req.body;

        if (!name || !topicId) {
            return res.status(400).json({ message: 'Name and Topic ID are required' });
        }

        const topic = await Topic.findById(topicId);
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        const studyMaterial = new StudyMaterial({
            name,
            originalName: req.file.originalname,
            description,
            fileUrl: `/uploads/${req.file.filename}`,
            fileType: req.file.mimetype,
            topicId,
            uploadedBy: req.user.id
        });

        await studyMaterial.save();
        res.status(201).json(studyMaterial);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during upload' });
    }
};

exports.getMaterialsByTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        const materials = await StudyMaterial.find({ topicId }).sort({ createdAt: -1 });
        res.json(materials);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllMaterials = async (req, res) => {
    try {
        const materials = await StudyMaterial.find()
            .populate('topicId', 'name')
            .sort({ createdAt: -1 });
        res.json(materials);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteMaterial = async (req, res) => {
    try {
        const material = await StudyMaterial.findById(req.params.id);
        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        // Delete file from filesystem
        const filePath = path.join(__dirname, '..', material.fileUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await StudyMaterial.findByIdAndDelete(req.params.id);
        res.json({ message: 'Material deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

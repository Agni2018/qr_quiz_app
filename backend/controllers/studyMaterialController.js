const StudyMaterial = require('../models/StudyMaterial');
const Topic = require('../models/Topic');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            const uploadDir = path.resolve(process.cwd(), 'uploads');
            console.log('[UPLOAD] Resolving Destination:', uploadDir);

            if (!fs.existsSync(uploadDir)) {
                console.log('[UPLOAD] Directory missing, creating:', uploadDir);
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Check if directory is writable
            fs.accessSync(uploadDir, fs.constants.W_OK);
            console.log('[UPLOAD] Destination is writable.');

            cb(null, uploadDir);
        } catch (err) {
            console.error('[UPLOAD] Multer Destination CRASH:', err);
            cb(err);
        }
    },
    filename: (req, file, cb) => {
        try {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const fname = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
            console.log('[UPLOAD] Generated filename:', fname);
            cb(null, fname);
        } catch (err) {
            console.error('[UPLOAD] Multer Filename Error:', err);
            cb(err);
        }
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

exports.uploadMiddleware = upload.single('file');

exports.uploadMaterial = async (req, res) => {
    console.log('[UPLOAD] Controller reached. File info:', req.file ? {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size
    } : 'MISSING');

    console.log('[UPLOAD] Request body:', req.body);

    try {
        if (!req.file) {
            console.error('[UPLOAD] Error: req.file is null');
            return res.status(400).json({ message: 'No file received by server' });
        }

        const { name, description, topicId } = req.body;

        if (!name || !topicId) {
            console.error('[UPLOAD] Error: Missing required fields', { name, topicId });
            return res.status(400).json({ message: 'Name and Topic ID are required' });
        }

        console.log('[UPLOAD] Verifying topic existence:', topicId);
        const topic = await Topic.findById(topicId);
        if (!topic) {
            console.error('[UPLOAD] Error: Topic not found in database');
            return res.status(404).json({ message: 'The selected topic no longer exists' });
        }

        const studyMaterial = new StudyMaterial({
            name,
            originalName: req.file.originalname,
            description,
            fileUrl: `/uploads/${req.file.filename}`,
            fileType: req.file.mimetype,
            topicId,
            uploadedBy: req.user?.id
        });

        console.log('[UPLOAD] Attempting to save StudyMaterial record to MongoDB...');
        await studyMaterial.save();
        console.log('[UPLOAD] Success! StudyMaterial saved.');

        res.status(201).json(studyMaterial);
    } catch (err) {
        console.error('[UPLOAD] FATAL ERROR in controller:', err);
        res.status(500).json({
            message: `Server failed to process upload. Error: ${err.message}`,
            details: err.toString(),
            code: err.code
        });
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
        const filePath = path.join(process.cwd(), material.fileUrl);
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

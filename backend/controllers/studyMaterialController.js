const StudyMaterial = require('../models/StudyMaterial');
const Topic = require('../models/Topic');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage for test
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

exports.uploadMiddleware = upload.single('file');

exports.uploadMaterial = async (req, res) => {
    req.on('aborted', () => console.log('[UPLOAD] Request aborted by client/proxy'));
    req.on('error', (err) => console.error('[UPLOAD] Request stream error:', err));

    try {
        if (!req.file || !req.file.buffer) {
            console.error('[UPLOAD] Error: req.file or buffer is missing');
            return res.status(400).json({ message: 'No file buffer received' });
        }

        const { name, description, topicId } = req.body;

        if (!name || !topicId) {
            return res.status(400).json({ message: 'Name and Topic ID are required' });
        }

        const topic = await Topic.findById(topicId);
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        // Manual disk write to test if disk storage was the issue
        const fileName = `file-${Date.now()}-${req.file.originalname}`;
        const uploadPath = path.resolve(process.cwd(), 'uploads', fileName);

        console.log('[UPLOAD] Manual write started:', uploadPath);
        fs.writeFileSync(uploadPath, req.file.buffer);
        console.log('[UPLOAD] Manual write finished successfully.');

        const studyMaterial = new StudyMaterial({
            name,
            originalName: req.file.originalname,
            description,
            fileUrl: `/uploads/${fileName}`,
            fileType: req.file.mimetype,
            topicId,
            uploadedBy: req.user?.id
        });

        await studyMaterial.save();
        res.status(201).json(studyMaterial);
    } catch (err) {
        console.error('Upload Process Error:', err);
        res.status(500).json({
            message: `Manual upload error: ${err.message}`,
            details: err.toString()
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

const express = require('express');
const router = express.Router();
const materialController = require('../controllers/studyMaterialController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/upload', protect, admin, materialController.uploadMiddleware, materialController.uploadMaterial);
router.get('/', protect, materialController.getAllMaterials);
router.get('/topic/:topicId', protect, materialController.getMaterialsByTopic);
router.delete('/:id', protect, admin, materialController.deleteMaterial);

module.exports = router;

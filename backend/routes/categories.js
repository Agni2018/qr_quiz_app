const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');
const { protect } = require('../middleware/authMiddleware');

// GET all categories
router.get('/', categoriesController.getAllCategories);

// POST create category
router.post('/', protect, categoriesController.createCategory);

// DELETE category
router.delete('/:id', protect, categoriesController.deleteCategory);

// POST copy category
router.post('/:id/copy', protect, categoriesController.copyCategory);

module.exports = router;

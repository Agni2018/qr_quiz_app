const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect, admin } = require('../middleware/authMiddleware');

// Route to send a message (Admin only)
router.post('/', protect, admin, messageController.sendMessage);

// Route to get messages for a student (Auth required)
router.get('/', protect, messageController.getMessages);

// Route to get unread count for a student (Auth required)
router.get('/unread-count', protect, messageController.getUnreadCount);

// Route to mark messages as read (Auth required)
router.patch('/read', protect, messageController.markAsRead);

module.exports = router;

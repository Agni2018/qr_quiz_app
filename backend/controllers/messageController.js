const Message = require('../models/Message');
const User = require('../models/User');

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { recipientId, text } = req.body;
        const senderId = req.user.id;

        if (!recipientId || !text) {
            return res.status(400).json({ message: 'Recipient and text are required' });
        }

        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }

        const newMessage = new Message({
            sender: senderId,
            recipient: recipientId,
            text
        });

        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get messages for the logged-in user
exports.getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const messages = await Message.find({ recipient: userId })
            .populate('sender', 'username')
            .sort({ createdAt: -1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await Message.countDocuments({ recipient: userId, isRead: false });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark as read
exports.markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { messageId } = req.body;

        if (messageId) {
            await Message.updateOne({ _id: messageId, recipient: userId }, { isRead: true });
        } else {
            await Message.updateMany({ recipient: userId, isRead: false }, { isRead: true });
        }

        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

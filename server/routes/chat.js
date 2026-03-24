const express = require('express');
const Message = require('../models/Message');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All chat routes require authentication
router.use(protect);

/**
 * GET /api/chat/conversations
 * Admin only: list all conversations with last message
 */
router.get('/conversations', adminOnly, async (req, res, next) => {
    try {
        // Aggregate to get unique conversations with last message
        const conversations = await Message.aggregate([
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: '$conversationId',
                    lastMessage: { $first: '$$ROOT' },
                    unreadCount: {
                        $sum: { $cond: [{ $and: [{ $eq: ['$senderRole', 'user'] }, { $eq: ['$read', false] }] }, 1, 0] }
                    },
                    messageCount: { $sum: 1 }
                }
            },
            { $sort: { 'lastMessage.createdAt': -1 } }
        ]);

        res.json(conversations);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/chat/:conversationId
 * Get message history for a conversation
 */
router.get('/:conversationId', async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId })
            .sort({ createdAt: 1 })
            .limit(100)
            .lean();

        res.json(messages);
    } catch (error) {
        next(error);
    }
});

module.exports = router;

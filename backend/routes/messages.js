// routes/messages.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Message = require('../models/Message');

router.get('/conversations', authenticate, async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      { $match: { $or: [{ sender: req.user._id }, { receiver: req.user._id }], isDeleted: false } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$conversationId', lastMessage: { $first: '$$ROOT' }, unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ['$receiver', req.user._id] }, { $eq: ['$isRead', false] }] }, 1, 0] } } } },
    ]);
    res.json(conversations);
  } catch (e) { res.status(500).json({ message: 'Failed to get conversations' }); }
});

router.get('/:conversationId', authenticate, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId, isDeleted: false })
      .sort({ createdAt: 1 }).populate('sender', 'username displayName avatar');
    res.json(messages);
  } catch (e) { res.status(500).json({ message: 'Failed to get messages' }); }
});

module.exports = router;

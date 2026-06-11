const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Notification = require('../models/Notification');

router.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 }).limit(50)
      .populate('sender', 'username displayName avatar');
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (e) { res.status(500).json({ message: 'Failed to get notifications' }); }
});

router.put('/read-all', authenticate, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
    res.json({ message: 'All notifications marked as read' });
  } catch (e) { res.status(500).json({ message: 'Failed to mark notifications' }); }
});

module.exports = router;

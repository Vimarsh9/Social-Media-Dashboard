const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { getRedisClient } = require('../config/redis');

const onlineUsers = new Map();

const socketHandler = (io) => {
  // Auth middleware for sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);

    const redis = getRedisClient();
    await redis.sadd('online_users', userId);
    await redis.setex(`user_socket:${userId}`, 3600, socket.id);

    io.emit('user:online', { userId, isOnline: true });
    console.log(`🔌 User connected: ${socket.user.username}`);

    // Join user's room
    socket.join(`user:${userId}`);

    // Handle direct messages
    socket.on('message:send', async (data) => {
      try {
        const { receiverId, content, media } = data;
        const conversationId = [userId, receiverId].sort().join('_');

        const message = await Message.create({
          sender: userId,
          receiver: receiverId,
          content,
          media,
          conversationId,
        });

        await message.populate('sender', 'username displayName avatar');

        // Send to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('message:receive', message);
        }

        // Send notification
        const notification = await Notification.create({
          recipient: receiverId,
          sender: userId,
          type: 'message',
          message: message._id,
          text: `${socket.user.username} sent you a message`,
        });

        // Push notification via Redis pub/sub
        await redis.publish('notifications', JSON.stringify({ userId: receiverId, notification }));

        socket.emit('message:sent', message);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicators
    socket.on('typing:start', ({ receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:start', { userId });
      }
    });

    socket.on('typing:stop', ({ receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:stop', { userId });
      }
    });

    // Mark messages as read
    socket.on('message:read', async ({ conversationId }) => {
      await Message.updateMany(
        { conversationId, receiver: userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );
    });

    // Like post real-time
    socket.on('post:like', ({ postId, authorId, liked }) => {
      const authorSocketId = onlineUsers.get(authorId);
      if (authorSocketId && authorId !== userId) {
        io.to(authorSocketId).emit('post:liked', { postId, userId, liked });
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      onlineUsers.delete(userId);
      await redis.srem('online_users', userId);
      await redis.del(`user_socket:${userId}`);

      await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
      io.emit('user:offline', { userId, isOnline: false });
      console.log(`🔌 User disconnected: ${socket.user.username}`);
    });
  });
};

module.exports = socketHandler;

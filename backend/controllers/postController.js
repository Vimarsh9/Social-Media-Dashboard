const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { getRedisClient } = require('../config/redis');

const createPost = async (req, res) => {
  try {
    const { content, tags, visibility } = req.body;
    const media = req.files?.map((f) => ({ url: f.path, type: f.mimetype.startsWith('image') ? 'image' : 'video' })) || [];

    const post = await Post.create({ author: req.user._id, content, media, tags: tags?.split(',').map(t => t.trim()) || [], visibility });
    await post.populate('author', 'username displayName avatar isVerified');

    // Invalidate feed cache
    const redis = getRedisClient();
    await redis.del(`feed:${req.user._id}`);

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create post', error: error.message });
  }
};

const getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const redis = getRedisClient();

    // Try cache for page 1
    if (page == 1) {
      const cached = await redis.get(`feed:${req.user._id}`);
      if (cached) return res.json(JSON.parse(cached));
    }

    const user = await User.findById(req.user._id);
    const feedUsers = [...user.following, req.user._id];

    const posts = await Post.find({ author: { $in: feedUsers }, isDeleted: false, visibility: { $ne: 'private' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username displayName avatar isVerified')
      .populate('comments.user', 'username displayName avatar');

    const total = await Post.countDocuments({ author: { $in: feedUsers }, isDeleted: false });

    const result = { posts, total, page: parseInt(page), pages: Math.ceil(total / limit) };

    if (page == 1) await redis.setex(`feed:${req.user._id}`, 300, JSON.stringify(result));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get feed', error: error.message });
  }
};

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isLiked = post.likes.includes(req.user._id);
    if (isLiked) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.push(req.user._id);
      if (post.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.author,
          sender: req.user._id,
          type: 'like',
          post: post._id,
          text: `${req.user.username} liked your post`,
        });
      }
    }

    post.calculateEngagement();
    await post.save();

    res.json({ liked: !isLiked, likeCount: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to like post' });
  }
};

const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ user: req.user._id, text });
    post.calculateEngagement();
    await post.save();
    await post.populate('comments.user', 'username displayName avatar');

    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        post: post._id,
        text: `${req.user.username} commented on your post`,
      });
    }

    const newComment = post.comments[post.comments.length - 1];
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });

    post.isDeleted = true;
    await post.save();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete post' });
  }
};

module.exports = { createPost, getFeed, likePost, addComment, deletePost };

const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate('followers', 'username displayName avatar')
      .populate('following', 'username displayName avatar');

    if (!user) return res.status(404).json({ message: 'User not found' });

    const posts = await Post.find({ author: user._id, isDeleted: false }).sort({ createdAt: -1 }).limit(20).populate('author', 'username displayName avatar');

    res.json({ user, posts, postCount: posts.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { displayName, bio, website, location } = req.body;
    const updates = { displayName, bio, website, location };
    if (req.file) updates.avatar = req.file.path;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

const followUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) return res.status(400).json({ message: 'Cannot follow yourself' });

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const isFollowing = req.user.following.includes(req.params.id);

    if (isFollowing) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user._id } });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $push: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $push: { followers: req.user._id } });

      await Notification.create({
        recipient: req.params.id,
        sender: req.user._id,
        type: 'follow',
        text: `${req.user.username} started following you`,
      });
    }

    res.json({ following: !isFollowing });
  } catch (error) {
    res.status(500).json({ message: 'Failed to follow/unfollow user' });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const users = await User.find({
      $or: [{ username: { $regex: q, $options: 'i' } }, { displayName: { $regex: q, $options: 'i' } }],
      isActive: true,
    }).select('username displayName avatar isVerified followers').limit(20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Search failed' });
  }
};

module.exports = { getProfile, updateProfile, followUser, searchUsers };

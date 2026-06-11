const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');

const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '7d' } = req.query;

    const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
    const days = daysMap[period] || 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const posts = await Post.find({ author: userId, createdAt: { $gte: since }, isDeleted: false });

    const totalLikes = posts.reduce((sum, p) => sum + p.likes.length, 0);
    const totalComments = posts.reduce((sum, p) => sum + p.comments.length, 0);
    const totalViews = posts.reduce((sum, p) => sum + p.viewCount, 0);

    const user = await User.findById(userId);

    // Daily breakdown
    const dailyData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayPosts = posts.filter((p) => p.createdAt >= dayStart && p.createdAt <= dayEnd);
      const dayLikes = dayPosts.reduce((sum, p) => sum + p.likes.length, 0);
      const dayComments = dayPosts.reduce((sum, p) => sum + p.comments.length, 0);

      dailyData.push({
        date: dayStart.toISOString().split('T')[0],
        posts: dayPosts.length,
        likes: dayLikes,
        comments: dayComments,
        engagement: dayLikes + dayComments * 2,
      });
    }

    // Top posts
    const topPosts = posts
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 5)
      .map((p) => ({ _id: p._id, content: p.content.slice(0, 100), likes: p.likes.length, comments: p.comments.length, views: p.viewCount }));

    res.json({
      summary: {
        totalPosts: posts.length,
        totalLikes,
        totalComments,
        totalViews,
        followers: user.followers.length,
        following: user.following.length,
        engagementRate: posts.length > 0 ? ((totalLikes + totalComments) / Math.max(totalViews, 1)) * 100 : 0,
      },
      dailyData,
      topPosts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get analytics', error: error.message });
  }
};

module.exports = { getUserAnalytics };

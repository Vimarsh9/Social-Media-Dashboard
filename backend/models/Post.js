const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 500 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, maxlength: 2000, default: '' },
    media: [
      {
        url: String,
        type: { type: String, enum: ['image', 'video'] },
        thumbnail: String,
      },
    ],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tags: [{ type: String, lowercase: true }],
    visibility: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public',
    },
    isDeleted: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    engagementScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ createdAt: -1 });

postSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});

postSchema.virtual('commentCount').get(function () {
  return this.comments.length;
});

postSchema.methods.calculateEngagement = function () {
  this.engagementScore =
    this.likes.length * 1 + this.comments.length * 2 + this.shares.length * 3 + this.viewCount * 0.1;
  return this.engagementScore;
};

module.exports = mongoose.model('Post', postSchema);

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, maxlength: 2000 },
    media: { url: String, type: { type: String, enum: ['image', 'video', 'file'] } },
    isRead: { type: Boolean, default: false },
    readAt: Date,
    isDeleted: { type: Boolean, default: false },
    conversationId: { type: String, required: true },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });

module.exports = mongoose.model('Message', messageSchema);

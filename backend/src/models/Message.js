const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: [true, 'Conversation is required']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderType',
    required: [true, 'Sender is required']
  },
  senderType: {
    type: String,
    enum: ['Admin', 'Manager', 'Client'],
    required: [true, 'Sender type is required']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [5000, 'Message cannot exceed 5000 characters']
  },
  images: [{
    url: { type: String, required: true },
    publicId: { type: String }
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for queries
messageSchema.index({ conversation: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);

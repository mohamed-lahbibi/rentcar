const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'participants.userType',
      required: true
    },
    userType: {
      type: String,
      enum: ['Admin', 'Manager', 'Client'],
      required: true
    }
  }],
  lastMessage: {
    content: { type: String },
    sender: { type: mongoose.Schema.Types.ObjectId },
    senderType: { type: String },
    sentAt: { type: Date }
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Index for finding conversations
conversationSchema.index({ 'participants.user': 1 });

module.exports = mongoose.model('Conversation', conversationSchema);

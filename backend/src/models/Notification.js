const mongoose = require('mongoose');
const { NOTIFICATION_TYPES } = require('../config/constants');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'recipientType',
    required: [true, 'Recipient is required']
  },
  recipientType: {
    type: String,
    enum: ['Admin', 'Manager', 'Client'],
    required: [true, 'Recipient type is required']
  },
  type: {
    type: String,
    enum: Object.values(NOTIFICATION_TYPES),
    required: [true, 'Notification type is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  link: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

const { Conversation, Message, Client } = require('../../models');
const { successResponse, notFoundResponse, createdResponse, parsePagination, paginatedResponse } = require('../../utils');

// @desc    Get all conversations
// @route   GET /api/admin/messages/conversations
const getConversations = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [conversations, total] = await Promise.all([
      Conversation.find({ 'participants.userType': { $in: ['Admin', 'Manager'] } })
        .populate('participants.user', 'name email photo')
        .sort({ updatedAt: -1 }).skip(skip).limit(limit),
      Conversation.countDocuments({ 'participants.userType': { $in: ['Admin', 'Manager'] } })
    ]);
    successResponse(res, 'Conversations retrieved', paginatedResponse(conversations, total, page, limit));
  } catch (error) { next(error); }
};

// @desc    Get conversation messages
// @route   GET /api/admin/messages/conversations/:id
const getConversationMessages = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [messages, total] = await Promise.all([
      Message.find({ conversation: req.params.id })
        .populate('sender', 'name photo').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Message.countDocuments({ conversation: req.params.id })
    ]);
    successResponse(res, 'Messages retrieved', paginatedResponse(messages.reverse(), total, page, limit));
  } catch (error) { next(error); }
};

// @desc    Start conversation with client
// @route   POST /api/admin/messages/conversations
const startConversation = async (req, res, next) => {
  try {
    const { clientId, subject, message } = req.body;
    const client = await Client.findById(clientId);
    if (!client) return notFoundResponse(res, 'Client');

    let conversation = await Conversation.findOne({
      'participants.user': { $all: [req.user._id, clientId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [
          { user: req.user._id, userType: req.userType === 'admin' ? 'Admin' : 'Manager' },
          { user: clientId, userType: 'Client' }
        ],
        subject
      });
    }

    if (message) {
      await Message.create({
        conversation: conversation._id, sender: req.user._id,
        senderType: req.userType === 'admin' ? 'Admin' : 'Manager', content: message
      });
      conversation.lastMessage = { content: message, sender: req.user._id, senderType: req.userType, sentAt: new Date() };
      await conversation.save();
    }

    createdResponse(res, 'Conversation started', conversation);
  } catch (error) { next(error); }
};

// @desc    Send message
// @route   POST /api/admin/messages/send
const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content, images } = req.body;
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return notFoundResponse(res, 'Conversation');

    const message = await Message.create({
      conversation: conversationId, sender: req.user._id,
      senderType: req.userType === 'admin' ? 'Admin' : 'Manager',
      content, images: images || []
    });

    conversation.lastMessage = { content, sender: req.user._id, senderType: req.userType, sentAt: new Date() };
    await conversation.save();

    createdResponse(res, 'Message sent', message);
  } catch (error) { next(error); }
};

module.exports = { getConversations, getConversationMessages, startConversation, sendMessage };

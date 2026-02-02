const { Conversation, Message, Admin, Manager } = require('../../models');
const { successResponse, notFoundResponse, createdResponse, parsePagination, paginatedResponse } = require('../../utils');

// @desc    Get my conversations
// @route   GET /api/client/messages/conversations
const getConversations = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [conversations, total] = await Promise.all([
      Conversation.find({ 'participants.user': req.user._id })
        .populate('participants.user', 'name photo').sort({ updatedAt: -1 }).skip(skip).limit(limit),
      Conversation.countDocuments({ 'participants.user': req.user._id })
    ]);
    successResponse(res, 'Conversations retrieved', paginatedResponse(conversations, total, page, limit));
  } catch (error) { next(error); }
};

// @desc    Get conversation messages
// @route   GET /api/client/messages/conversations/:id
const getConversationMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.id, 'participants.user': req.user._id });
    if (!conversation) return notFoundResponse(res, 'Conversation');

    const { page, limit, skip } = parsePagination(req.query);
    const [messages, total] = await Promise.all([
      Message.find({ conversation: req.params.id }).populate('sender', 'name photo').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Message.countDocuments({ conversation: req.params.id })
    ]);
    successResponse(res, 'Messages retrieved', paginatedResponse(messages.reverse(), total, page, limit));
  } catch (error) { next(error); }
};

// @desc    Start conversation
// @route   POST /api/client/messages/conversations
const startConversation = async (req, res, next) => {
  try {
    const { subject, message } = req.body;
    const admin = await Admin.findOne({ isActive: true });
    if (!admin) return notFoundResponse(res, 'Support');

    let conversation = await Conversation.findOne({ 'participants.user': { $all: [req.user._id, admin._id] } });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [{ user: req.user._id, userType: 'Client' }, { user: admin._id, userType: 'Admin' }],
        subject
      });
    }

    if (message) {
      await Message.create({ conversation: conversation._id, sender: req.user._id, senderType: 'Client', content: message });
      conversation.lastMessage = { content: message, sender: req.user._id, senderType: 'Client', sentAt: new Date() };
      await conversation.save();
    }
    createdResponse(res, 'Conversation started', conversation);
  } catch (error) { next(error); }
};

// @desc    Send message
// @route   POST /api/client/messages/send
const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content } = req.body;
    const conversation = await Conversation.findOne({ _id: conversationId, 'participants.user': req.user._id });
    if (!conversation) return notFoundResponse(res, 'Conversation');

    const message = await Message.create({ conversation: conversationId, sender: req.user._id, senderType: 'Client', content });
    conversation.lastMessage = { content, sender: req.user._id, senderType: 'Client', sentAt: new Date() };
    await conversation.save();

    createdResponse(res, 'Message sent', message);
  } catch (error) { next(error); }
};

module.exports = { getConversations, getConversationMessages, startConversation, sendMessage };

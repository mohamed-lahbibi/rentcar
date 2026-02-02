const { Message, Conversation } = require('../models');
const { notifyNewMessage } = require('../services/notificationService');

const setupMessageHandlers = (io, socket) => {
  // Join conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`User ${socket.userId} joined conversation ${conversationId}`);
  });

  // Leave conversation room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
  });

  // Send message
  socket.on('send_message', async (data) => {
    try {
      const { conversationId, content, images } = data;

      // Create message
      const message = await Message.create({
        conversation: conversationId,
        sender: socket.userId,
        senderType: socket.userType.charAt(0).toUpperCase() + socket.userType.slice(1),
        content,
        images: images || []
      });

      // Update conversation's last message
      const conversation = await Conversation.findByIdAndUpdate(
        conversationId,
        {
          lastMessage: {
            content,
            sender: socket.userId,
            senderType: socket.userType,
            sentAt: new Date()
          }
        },
        { new: true }
      );

      // Emit to conversation room
      io.to(`conversation_${conversationId}`).emit('new_message', {
        _id: message._id,
        conversation: conversationId,
        sender: {
          _id: socket.userId,
          name: socket.user.name
        },
        senderType: message.senderType,
        content: message.content,
        images: message.images,
        createdAt: message.createdAt
      });

      // Send notification to other participants
      if (conversation) {
        for (const participant of conversation.participants) {
          if (participant.user.toString() !== socket.userId) {
            await notifyNewMessage(
              participant.user,
              participant.userType,
              socket.user.name,
              conversationId
            );
          }
        }
      }
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Mark messages as read
  socket.on('mark_read', async (data) => {
    try {
      const { conversationId, messageIds } = data;

      await Message.updateMany(
        { _id: { $in: messageIds }, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      io.to(`conversation_${conversationId}`).emit('messages_read', {
        messageIds,
        readBy: socket.userId
      });
    } catch (error) {
      console.error('Mark read error:', error);
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { conversationId, isTyping } = data;
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      userId: socket.userId,
      userName: socket.user.name,
      isTyping
    });
  });
};

module.exports = { setupMessageHandlers };

const { getIO } = require('../config/socket');

// Emit to specific user room
const emitToUser = (userId, event, data) => {
  try {
    const io = getIO();
    io.to(`user_${userId}`).emit(event, data);
  } catch (error) {
    console.log('Socket emit error:', error.message);
  }
};

// Emit to all admins
const emitToAdmins = (event, data) => {
  try {
    const io = getIO();
    io.to('admins').emit(event, data);
  } catch (error) {
    console.log('Socket emit error:', error.message);
  }
};

// Emit to conversation room
const emitToConversation = (conversationId, event, data) => {
  try {
    const io = getIO();
    io.to(`conversation_${conversationId}`).emit(event, data);
  } catch (error) {
    console.log('Socket emit error:', error.message);
  }
};

// Emit new message
const emitNewMessage = (conversationId, message) => {
  emitToConversation(conversationId, 'new_message', message);
};

// Emit message read status
const emitMessageRead = (conversationId, messageId, readBy) => {
  emitToConversation(conversationId, 'message_read', { messageId, readBy });
};

// Emit typing indicator
const emitTyping = (conversationId, userId, userName, isTyping) => {
  emitToConversation(conversationId, 'typing', { userId, userName, isTyping });
};

// Emit reservation update
const emitReservationUpdate = (reservation) => {
  // Emit to admins
  emitToAdmins('reservation_update', reservation);
  
  // Emit to the client
  if (reservation.client) {
    emitToUser(reservation.client, 'reservation_update', reservation);
  }
};

module.exports = {
  emitToUser,
  emitToAdmins,
  emitToConversation,
  emitNewMessage,
  emitMessageRead,
  emitTyping,
  emitReservationUpdate
};

const { authenticateSocket } = require('./authSocket');
const { setupMessageHandlers } = require('./messageSocket');
const { setupNotificationHandlers } = require('./notificationSocket');

const setupSocketHandlers = (io, socket) => {
  // Authenticate socket if not already done
  if (!socket.userId) {
    authenticateSocket(socket, (err) => {
      if (err) {
        console.log('Socket authentication failed:', err.message);
        socket.disconnect(true);
        return;
      }
      initializeSocket(io, socket);
    });
  } else {
    initializeSocket(io, socket);
  }
};

const initializeSocket = (io, socket) => {
  // Join user's personal room
  socket.join(`user_${socket.userId}`);
  
  // Join role-based room
  if (socket.userType === 'admin' || socket.userType === 'manager') {
    socket.join('admins');
  }
  
  console.log(`👤 User ${socket.user?.name || socket.userId} connected (${socket.userType})`);

  // Setup handlers
  setupMessageHandlers(io, socket);
  setupNotificationHandlers(io, socket);

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`👤 User ${socket.user?.name || socket.userId} disconnected`);
  });
};

module.exports = { setupSocketHandlers };

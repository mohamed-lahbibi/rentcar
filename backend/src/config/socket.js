const { Server } = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Import socket handlers
  const { setupSocketHandlers } = require('../sockets');
  
  io.on('connection', (socket) => {
    console.log(`🔌 New socket connection: ${socket.id}`);
    
    setupSocketHandlers(io, socket);
    
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} - ${reason}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };

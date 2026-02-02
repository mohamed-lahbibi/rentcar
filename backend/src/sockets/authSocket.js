const jwt = require('jsonwebtoken');
const { Admin, Manager, Client } = require('../models');

// Authenticate socket connection
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user;
    if (decoded.type === 'admin') {
      user = await Admin.findById(decoded.id);
    } else if (decoded.type === 'manager') {
      user = await Manager.findById(decoded.id);
    } else if (decoded.type === 'client') {
      user = await Client.findById(decoded.id);
    }

    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user;
    socket.userType = decoded.type;
    socket.userId = decoded.id;
    
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
};

module.exports = { authenticateSocket };

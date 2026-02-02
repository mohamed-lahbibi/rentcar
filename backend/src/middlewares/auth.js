const jwt = require('jsonwebtoken');
const { Admin, Manager, Client } = require('../models');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Determine user type and fetch user
      let user;
      if (decoded.type === 'admin') {
        user = await Admin.findById(decoded.id);
        req.userType = 'admin';
      } else if (decoded.type === 'manager') {
        user = await Manager.findById(decoded.id);
        req.userType = 'manager';
      } else if (decoded.type === 'client') {
        user = await Client.findById(decoded.id);
        req.userType = 'client';
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.isActive && decoded.type !== 'client') {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      if (decoded.type === 'client' && user.isBlocked) {
        return res.status(401).json({
          success: false,
          message: 'Account is blocked'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Optional auth - attach user if token exists but don't require it
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        let user;
        if (decoded.type === 'client') {
          user = await Client.findById(decoded.id);
          req.userType = 'client';
        }
        
        req.user = user;
      } catch (error) {
        // Token invalid but continue without user
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect, optionalAuth };

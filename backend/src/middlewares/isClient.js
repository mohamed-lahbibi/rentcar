// Check if user is a Client
const isClient = (req, res, next) => {
  if (req.userType !== 'client') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Client role required.'
    });
  }
  next();
};

// Check if client is verified
const isVerified = (req, res, next) => {
  if (req.userType !== 'client') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Client role required.'
    });
  }
  
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your account first'
    });
  }
  
  next();
};

module.exports = { isClient, isVerified };

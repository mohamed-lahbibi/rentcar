// Check if user is Admin or Manager
const isAdmin = (req, res, next) => {
  if (req.userType !== 'admin' && req.userType !== 'manager') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Manager role required.'
    });
  }
  next();
};

// Check if user is Super Admin only
const isSuperAdmin = (req, res, next) => {
  if (req.userType !== 'admin' || req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super Admin role required.'
    });
  }
  next();
};

// Check if manager has specific permission
const hasPermission = (permission) => {
  return (req, res, next) => {
    // Admins have all permissions
    if (req.userType === 'admin') {
      return next();
    }
    
    // Check manager permissions
    if (req.userType === 'manager') {
      if (!req.user.permissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Missing permission: ${permission}`
        });
      }
    }
    
    next();
  };
};

module.exports = { isAdmin, isSuperAdmin, hasPermission };

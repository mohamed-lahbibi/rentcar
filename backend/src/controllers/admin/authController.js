const crypto = require('crypto');
const { Admin, Manager } = require('../../models');
const { generateToken, generateRandomToken, hashToken, successResponse, errorResponse } = require('../../utils');
const { sendPasswordResetEmail } = require('../../services/emailService');

// @desc    Login admin/manager
// @route   POST /api/admin/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists in Admin or Manager
    let user = await Admin.findOne({ email }).select('+password');
    let userType = 'admin';

    if (!user) {
      user = await Manager.findOne({ email }).select('+password');
      userType = 'manager';
    }

    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Check if account is active
    if (!user.isActive) {
      return errorResponse(res, 'Account is deactivated', 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id, userType);

    successResponse(res, 'Login successful', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: userType === 'admin' ? user.role : 'manager',
        permissions: userType === 'manager' ? user.permissions : null,
        photo: user.photo
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/admin/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    
    successResponse(res, 'Profile retrieved', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: req.userType === 'admin' ? user.role : 'manager',
      phone: user.phone,
      photo: user.photo,
      permissions: req.userType === 'manager' ? user.permissions : null,
      companyInfo: req.userType === 'admin' ? user.companyInfo : null,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request password reset
// @route   POST /api/admin/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    let user = await Admin.findOne({ email });
    let userModel = Admin;

    if (!user) {
      user = await Manager.findOne({ email });
      userModel = Manager;
    }

    if (!user) {
      return errorResponse(res, 'No account with that email', 404);
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    user.resetPasswordToken = hashToken(resetToken);
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Send email
    await sendPasswordResetEmail(user, resetToken);

    successResponse(res, 'Password reset email sent');
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/admin/auth/reset-password/:token
const resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = hashToken(req.params.token);

    let user = await Admin.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      user = await Manager.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
      });
    }

    if (!user) {
      return errorResponse(res, 'Invalid or expired token', 400);
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    successResponse(res, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/admin/auth/update-password
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const Model = req.userType === 'admin' ? Admin : Manager;
    const user = await Model.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect', 400);
    }

    user.password = newPassword;
    await user.save();

    successResponse(res, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword
};

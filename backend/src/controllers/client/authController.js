const { Client } = require('../../models');
const { generateToken, generateRandomToken, hashToken, successResponse, errorResponse, createdResponse } = require('../../utils');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../../services/emailService');

// @desc    Register client
// @route   POST /api/client/auth/register
const register = async (req, res, next) => {
  try {
    const { email, CIN } = req.body;
    
    const existingClient = await Client.findOne({ $or: [{ email }, { CIN }] });
    if (existingClient) {
      return errorResponse(res, existingClient.email === email ? 'Email already exists' : 'CIN already registered', 400);
    }

    const client = await Client.create(req.body);
    await sendWelcomeEmail(client);
    const token = generateToken(client._id, 'client');

    createdResponse(res, 'Registration successful', {
      token,
      user: { id: client._id, name: client.name, email: client.email, phone: client.phone }
    });
  } catch (error) { next(error); }
};

// @desc    Login client
// @route   POST /api/client/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const client = await Client.findOne({ email }).select('+password');

    if (!client || !(await client.comparePassword(password))) {
      return errorResponse(res, 'Invalid credentials', 401);
    }
    if (client.isBlocked) {
      return errorResponse(res, `Account blocked: ${client.blockReason || 'Contact support'}`, 401);
    }

    client.lastLogin = new Date();
    await client.save();
    const token = generateToken(client._id, 'client');

    successResponse(res, 'Login successful', {
      token,
      user: { id: client._id, name: client.name, email: client.email, photo: client.photo, score: client.score, isVerified: client.isVerified }
    });
  } catch (error) { next(error); }
};

// @desc    Forgot password
// @route   POST /api/client/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const client = await Client.findOne({ email: req.body.email });
    if (!client) return errorResponse(res, 'No account with that email', 404);

    const resetToken = generateRandomToken();
    client.resetPasswordToken = hashToken(resetToken);
    client.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
    await client.save();
    await sendPasswordResetEmail(client, resetToken);

    successResponse(res, 'Password reset email sent');
  } catch (error) { next(error); }
};

// @desc    Reset password
// @route   PUT /api/client/auth/reset-password/:token
const resetPassword = async (req, res, next) => {
  try {
    const client = await Client.findOne({
      resetPasswordToken: hashToken(req.params.token),
      resetPasswordExpire: { $gt: Date.now() }
    });
    if (!client) return errorResponse(res, 'Invalid or expired token', 400);

    client.password = req.body.password;
    client.resetPasswordToken = undefined;
    client.resetPasswordExpire = undefined;
    await client.save();

    successResponse(res, 'Password reset successful');
  } catch (error) { next(error); }
};

module.exports = { register, login, forgotPassword, resetPassword };

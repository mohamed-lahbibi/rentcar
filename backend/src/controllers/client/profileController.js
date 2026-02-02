const { Client } = require('../../models');
const { successResponse, errorResponse } = require('../../utils');
const { deleteImage } = require('../../services/uploadService');

// @desc    Get profile
// @route   GET /api/client/profile
const getProfile = async (req, res, next) => {
  try {
    successResponse(res, 'Profile retrieved', {
      id: req.user._id, name: req.user.name, email: req.user.email, phone: req.user.phone,
      CIN: req.user.CIN, drivingLicense: req.user.drivingLicense, address: req.user.address,
      photo: req.user.photo, score: req.user.score, totalReservations: req.user.totalReservations,
      isVerified: req.user.isVerified
    });
  } catch (error) { next(error); }
};

// @desc    Update profile
// @route   PUT /api/client/profile
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'drivingLicense', 'address'];
    allowedFields.forEach(field => { if (req.body[field]) req.user[field] = req.body[field]; });
    
    if (req.file) {
      if (req.user.photo) {
        const publicId = req.user.photo.split('/').slice(-2).join('/').split('.')[0];
        await deleteImage(publicId);
      }
      req.user.photo = req.file.path;
    }
    
    await req.user.save();
    successResponse(res, 'Profile updated', { name: req.user.name, phone: req.user.phone, photo: req.user.photo });
  } catch (error) { next(error); }
};

// @desc    Change password
// @route   PUT /api/client/profile/password
const changePassword = async (req, res, next) => {
  try {
    const client = await Client.findById(req.user._id).select('+password');
    if (!(await client.comparePassword(req.body.currentPassword))) {
      return errorResponse(res, 'Current password is incorrect', 400);
    }
    client.password = req.body.newPassword;
    await client.save();
    successResponse(res, 'Password changed successfully');
  } catch (error) { next(error); }
};

module.exports = { getProfile, updateProfile, changePassword };

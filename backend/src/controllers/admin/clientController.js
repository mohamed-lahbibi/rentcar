const { Client, Reservation, ClientScore } = require('../../models');
const { successResponse, errorResponse, notFoundResponse, parsePagination, paginatedResponse } = require('../../utils');
const { createNotification } = require('../../services/notificationService');
const { NOTIFICATION_TYPES } = require('../../config/constants');

// @desc    Get all clients
// @route   GET /api/admin/clients
const getClients = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, isBlocked, isVerified } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { CIN: { $regex: search, $options: 'i' } }
      ];
    }
    if (isBlocked !== undefined) filter.isBlocked = isBlocked === 'true';
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

    const [clients, total] = await Promise.all([
      Client.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Client.countDocuments(filter)
    ]);

    successResponse(res, 'Clients retrieved', paginatedResponse(clients, total, page, limit));
  } catch (error) {
    next(error);
  }
};

// @desc    Get single client
// @route   GET /api/admin/clients/:id
const getClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id).select('-password');
    if (!client) return notFoundResponse(res, 'Client');

    const scoreHistory = await ClientScore.find({ client: client._id })
      .populate('createdBy', 'name').sort({ createdAt: -1 }).limit(10);

    successResponse(res, 'Client retrieved', { ...client.toObject(), scoreHistory });
  } catch (error) {
    next(error);
  }
};

// @desc    Block/Unblock client
// @route   PUT /api/admin/clients/:id/block
const toggleBlockClient = async (req, res, next) => {
  try {
    const { isBlocked, reason } = req.body;
    const client = await Client.findById(req.params.id);
    if (!client) return notFoundResponse(res, 'Client');

    client.isBlocked = isBlocked;
    client.blockReason = isBlocked ? reason : null;
    await client.save();

    await createNotification({
      recipientId: client._id,
      recipientType: 'Client',
      type: isBlocked ? NOTIFICATION_TYPES.ACCOUNT_BLOCKED : NOTIFICATION_TYPES.ACCOUNT_UNBLOCKED,
      title: isBlocked ? 'Account Blocked' : 'Account Unblocked',
      message: isBlocked ? `Your account has been blocked. Reason: ${reason}` : 'Your account has been unblocked.'
    });

    successResponse(res, `Client ${isBlocked ? 'blocked' : 'unblocked'} successfully`);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify client
// @route   PUT /api/admin/clients/:id/verify
const verifyClient = async (req, res, next) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    if (!client) return notFoundResponse(res, 'Client');
    successResponse(res, 'Client verified successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get client reservations
// @route   GET /api/admin/clients/:id/reservations
const getClientReservations = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [reservations, total] = await Promise.all([
      Reservation.find({ client: req.params.id }).populate('car', 'brand model').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Reservation.countDocuments({ client: req.params.id })
    ]);
    successResponse(res, 'Client reservations retrieved', paginatedResponse(reservations, total, page, limit));
  } catch (error) {
    next(error);
  }
};

module.exports = { getClients, getClient, toggleBlockClient, verifyClient, getClientReservations };

const { ClientScore, Client } = require('../../models');
const { successResponse, notFoundResponse, createdResponse, parsePagination, paginatedResponse } = require('../../utils');
const { createNotification } = require('../../services/notificationService');
const { NOTIFICATION_TYPES } = require('../../config/constants');

// @desc    Add client score
// @route   POST /api/admin/scores
const addScore = async (req, res, next) => {
  try {
    const { client, reservation, score, reason, comment } = req.body;

    const scoreRecord = await ClientScore.create({
      client, reservation, score, reason, comment,
      createdBy: req.user._id,
      createdByType: req.userType === 'admin' ? 'Admin' : 'Manager'
    });

    await createNotification({
      recipientId: client, recipientType: 'Client',
      type: NOTIFICATION_TYPES.SCORE_ADDED,
      title: score >= 0 ? 'Score Added' : 'Score Deducted',
      message: `${Math.abs(score)} points ${score >= 0 ? 'added to' : 'deducted from'} your score. Reason: ${reason}`,
      data: { score, reason }
    });

    createdResponse(res, 'Score added successfully', scoreRecord);
  } catch (error) { next(error); }
};

// @desc    Get client scores
// @route   GET /api/admin/scores/:clientId
const getClientScores = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [scores, total] = await Promise.all([
      ClientScore.find({ client: req.params.clientId })
        .populate('reservation', 'pickupDate returnDate').populate('createdBy', 'name')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      ClientScore.countDocuments({ client: req.params.clientId })
    ]);
    successResponse(res, 'Scores retrieved', paginatedResponse(scores, total, page, limit));
  } catch (error) { next(error); }
};

module.exports = { addScore, getClientScores };

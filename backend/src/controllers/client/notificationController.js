const { Notification } = require('../../models');
const { successResponse, parsePagination, paginatedResponse } = require('../../utils');

// @desc    Get notifications
// @route   GET /api/client/notifications
const getNotifications = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = { recipient: req.user._id, recipientType: 'Client' };

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ ...filter, isRead: false })
    ]);
    successResponse(res, 'Notifications retrieved', { ...paginatedResponse(notifications, total, page, limit), unreadCount });
  } catch (error) { next(error); }
};

// @desc    Mark as read
// @route   PUT /api/client/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true, readAt: new Date() }
    );
    successResponse(res, 'Notification marked as read');
  } catch (error) { next(error); }
};

// @desc    Mark all as read
// @route   PUT /api/client/notifications/read-all
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, recipientType: 'Client', isRead: false },
      { isRead: true, readAt: new Date() }
    );
    successResponse(res, 'All notifications marked as read');
  } catch (error) { next(error); }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };

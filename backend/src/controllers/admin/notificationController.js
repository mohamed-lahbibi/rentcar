const { Notification } = require('../../models');
const { successResponse, parsePagination, paginatedResponse } = require('../../utils');

// @desc    Get notifications
// @route   GET /api/admin/notifications
const getNotifications = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { isRead } = req.query;
    const filter = { recipient: req.user._id, recipientType: req.userType === 'admin' ? 'Admin' : 'Manager' };
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ ...filter, isRead: false })
    ]);

    successResponse(res, 'Notifications retrieved', { ...paginatedResponse(notifications, total, page, limit), unreadCount });
  } catch (error) { next(error); }
};

// @desc    Mark notification as read
// @route   PUT /api/admin/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true, readAt: new Date() });
    successResponse(res, 'Notification marked as read');
  } catch (error) { next(error); }
};

// @desc    Mark all as read
// @route   PUT /api/admin/notifications/read-all
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, recipientType: req.userType === 'admin' ? 'Admin' : 'Manager', isRead: false },
      { isRead: true, readAt: new Date() }
    );
    successResponse(res, 'All notifications marked as read');
  } catch (error) { next(error); }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };

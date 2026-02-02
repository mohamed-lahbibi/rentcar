const { Notification } = require('../models');

const setupNotificationHandlers = (io, socket) => {
  // Mark notification as read
  socket.on('mark_notification_read', async (notificationId) => {
    try {
      await Notification.findByIdAndUpdate(notificationId, {
        isRead: true,
        readAt: new Date()
      });
      
      socket.emit('notification_marked_read', { notificationId });
    } catch (error) {
      console.error('Mark notification read error:', error);
    }
  });

  // Mark all notifications as read
  socket.on('mark_all_notifications_read', async () => {
    try {
      await Notification.updateMany(
        { 
          recipient: socket.userId, 
          recipientType: socket.userType.charAt(0).toUpperCase() + socket.userType.slice(1),
          isRead: false 
        },
        { isRead: true, readAt: new Date() }
      );
      
      socket.emit('all_notifications_marked_read');
    } catch (error) {
      console.error('Mark all notifications read error:', error);
    }
  });

  // Get unread count
  socket.on('get_unread_count', async () => {
    try {
      const count = await Notification.countDocuments({
        recipient: socket.userId,
        recipientType: socket.userType.charAt(0).toUpperCase() + socket.userType.slice(1),
        isRead: false
      });
      
      socket.emit('unread_count', { count });
    } catch (error) {
      console.error('Get unread count error:', error);
    }
  });
};

module.exports = { setupNotificationHandlers };

const { Notification } = require('../models');
const { getIO } = require('../config/socket');
const { NOTIFICATION_TYPES } = require('../config/constants');

// Create and emit notification
const createNotification = async (data) => {
  try {
    const notification = await Notification.create({
      recipient: data.recipientId,
      recipientType: data.recipientType,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data || {},
      link: data.link || null
    });

    // Emit real-time notification
    try {
      const io = getIO();
      io.to(`user_${data.recipientId}`).emit('notification', {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        createdAt: notification.createdAt
      });
    } catch (socketError) {
      console.log('Socket not initialized, notification saved to database');
    }

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

// Notify about new reservation
const notifyNewReservation = async (reservation, client, car) => {
  // Notify all admins and managers
  const { Admin, Manager } = require('../models');
  const admins = await Admin.find({ isActive: true });
  const managers = await Manager.find({ isActive: true });

  const recipients = [
    ...admins.map(a => ({ id: a._id, type: 'Admin' })),
    ...managers.map(m => ({ id: m._id, type: 'Manager' }))
  ];

  for (const recipient of recipients) {
    await createNotification({
      recipientId: recipient.id,
      recipientType: recipient.type,
      type: NOTIFICATION_TYPES.RESERVATION_NEW,
      title: 'New Reservation',
      message: `${client.name} has requested to rent ${car.brand} ${car.model}`,
      data: { reservationId: reservation._id, clientId: client._id, carId: car._id },
      link: `/admin/reservations/${reservation._id}`
    });
  }
};

// Notify client about reservation approval
const notifyReservationApproved = async (reservation, client, car) => {
  await createNotification({
    recipientId: client._id,
    recipientType: 'Client',
    type: NOTIFICATION_TYPES.RESERVATION_APPROVED,
    title: 'Reservation Approved',
    message: `Your reservation for ${car.brand} ${car.model} has been approved!`,
    data: { reservationId: reservation._id, carId: car._id },
    link: `/reservations/${reservation._id}`
  });
};

// Notify client about reservation rejection
const notifyReservationRejected = async (reservation, client, car, reason) => {
  await createNotification({
    recipientId: client._id,
    recipientType: 'Client',
    type: NOTIFICATION_TYPES.RESERVATION_REJECTED,
    title: 'Reservation Update',
    message: `Your reservation for ${car.brand} ${car.model} could not be approved. ${reason ? `Reason: ${reason}` : ''}`,
    data: { reservationId: reservation._id, carId: car._id, reason },
    link: `/reservations/${reservation._id}`
  });
};

// Notify about new message
const notifyNewMessage = async (recipientId, recipientType, senderName, conversationId) => {
  await createNotification({
    recipientId,
    recipientType,
    type: NOTIFICATION_TYPES.MESSAGE_NEW,
    title: 'New Message',
    message: `You have a new message from ${senderName}`,
    data: { conversationId },
    link: `/messages/${conversationId}`
  });
};

// Get unread count for user
const getUnreadCount = async (userId, userType) => {
  return await Notification.countDocuments({
    recipient: userId,
    recipientType: userType,
    isRead: false
  });
};

module.exports = {
  createNotification,
  notifyNewReservation,
  notifyReservationApproved,
  notifyReservationRejected,
  notifyNewMessage,
  getUnreadCount
};

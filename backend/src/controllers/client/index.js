module.exports = {
  ...require('./authController'),
  ...require('./profileController'),
  ...require('./carController'),
  ...require('./reservationController'),
  ...require('./contractController'),
  ...require('./messageController'),
  ...require('./notificationController')
};

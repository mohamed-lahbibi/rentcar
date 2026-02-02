module.exports = {
  ...require('./authController'),
  ...require('./dashboardController'),
  ...require('./managerController'),
  ...require('./categoryController'),
  ...require('./carController'),
  ...require('./reservationController'),
  ...require('./contractController'),
  ...require('./maintenanceController'),
  ...require('./clientController'),
  ...require('./scoreController'),
  ...require('./messageController'),
  ...require('./notificationController'),
  ...require('./settingsController')
};

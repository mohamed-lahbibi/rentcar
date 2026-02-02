const emailService = require('./emailService');
const pdfService = require('./pdfService');
const uploadService = require('./uploadService');
const notificationService = require('./notificationService');
const socketService = require('./socketService');

module.exports = {
  ...emailService,
  ...pdfService,
  ...uploadService,
  ...notificationService,
  ...socketService
};

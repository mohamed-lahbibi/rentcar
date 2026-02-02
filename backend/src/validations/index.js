const adminValidation = require('./adminValidation');
const clientValidation = require('./clientValidation');

module.exports = {
  ...adminValidation,
  ...clientValidation
};

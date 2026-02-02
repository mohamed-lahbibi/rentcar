const { Settings } = require('../../models');
const { successResponse } = require('../../utils');

// @desc    Get settings
// @route   GET /api/admin/settings
const getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();
    successResponse(res, 'Settings retrieved', settings);
  } catch (error) { next(error); }
};

// @desc    Update settings
// @route   PUT /api/admin/settings
const updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    const fields = ['companyInfo', 'termsAndConditions', 'workingHours', 'notificationPreferences', 'rentalPolicies', 'currency'];
    fields.forEach(field => {
      if (req.body[field]) {
        if (typeof req.body[field] === 'object' && settings[field]) {
          Object.assign(settings[field], req.body[field]);
        } else {
          settings[field] = req.body[field];
        }
      }
    });

    if (req.file) settings.companyInfo.logo = req.file.path;
    await settings.save();

    successResponse(res, 'Settings updated', settings);
  } catch (error) { next(error); }
};

module.exports = { getSettings, updateSettings };

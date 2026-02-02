const router = require('express').Router();
const { Settings } = require('../../models');
const { successResponse } = require('../../utils');

// @desc    Get public settings (company info only)
// @route   GET /api/client/settings
router.get('/', async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();
    successResponse(res, 'Settings retrieved', {
      companyName: settings.companyInfo?.name || 'RentCar',
      email: settings.companyInfo?.email || '',
      phone: settings.companyInfo?.phone || '',
      address: settings.companyInfo?.address || '',
      logo: settings.companyInfo?.logo || null,
      description: settings.companyInfo?.description || ''
    });
  } catch (error) { next(error); }
});

module.exports = router;

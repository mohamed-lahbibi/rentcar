const router = require('express').Router();
const { getSettings, updateSettings } = require('../../controllers/admin');
const { protect } = require('../../middlewares/auth');
const { isSuperAdmin } = require('../../middlewares/isAdmin');
const { uploadUserPhoto } = require('../../middlewares/upload');
const { validate } = require('../../middlewares/validate');
const { settingsSchema } = require('../../validations');

router.use(protect, isSuperAdmin);

router.route('/').get(getSettings).put(uploadUserPhoto.single('logo'), validate(settingsSchema), updateSettings);

module.exports = router;

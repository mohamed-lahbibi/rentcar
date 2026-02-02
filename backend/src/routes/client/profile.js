const router = require('express').Router();
const { getProfile, updateProfile, changePassword } = require('../../controllers/client');
const { protect } = require('../../middlewares/auth');
const { isClient } = require('../../middlewares/isClient');
const { uploadUserPhoto } = require('../../middlewares/upload');
const { validate } = require('../../middlewares/validate');
const { profileUpdateSchema, changePasswordSchema } = require('../../validations');

router.use(protect, isClient);

router.route('/').get(getProfile).put(uploadUserPhoto.single('photo'), validate(profileUpdateSchema), updateProfile);
router.put('/password', validate(changePasswordSchema), changePassword);

module.exports = router;

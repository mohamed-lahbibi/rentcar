const router = require('express').Router();
const { login, getMe, forgotPassword, resetPassword, updatePassword } = require('../../controllers/admin');
const { protect } = require('../../middlewares/auth');
const { isAdmin } = require('../../middlewares/isAdmin');
const { validate } = require('../../middlewares/validate');
const { loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../../validations');

router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.put('/reset-password/:token', validate(resetPasswordSchema), resetPassword);
router.get('/me', protect, isAdmin, getMe);
router.put('/update-password', protect, isAdmin, updatePassword);

module.exports = router;

const router = require('express').Router();
const { register, login, forgotPassword, resetPassword } = require('../../controllers/client');
const { validate } = require('../../middlewares/validate');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../../validations');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.put('/reset-password/:token', validate(resetPasswordSchema), resetPassword);

module.exports = router;

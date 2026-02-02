const router = require('express').Router();

router.use('/auth', require('./auth'));
router.use('/dashboard', require('./dashboard'));
router.use('/managers', require('./managers'));
router.use('/categories', require('./categories'));
router.use('/cars', require('./cars'));
router.use('/reservations', require('./reservations'));
router.use('/contracts', require('./contracts'));
router.use('/maintenance', require('./maintenance'));
router.use('/clients', require('./clients'));
router.use('/scores', require('./scores'));
router.use('/messages', require('./messages'));
router.use('/notifications', require('./notifications'));
router.use('/settings', require('./settings'));

module.exports = router;

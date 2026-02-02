const router = require('express').Router();

router.use('/auth', require('./auth'));
router.use('/profile', require('./profile'));
router.use('/cars', require('./cars'));
router.use('/reservations', require('./reservations'));
router.use('/contracts', require('./contracts'));
router.use('/messages', require('./messages'));
router.use('/notifications', require('./notifications'));
router.use('/settings', require('./settings'));

module.exports = router;

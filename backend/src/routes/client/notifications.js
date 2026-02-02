const router = require('express').Router();
const { getNotifications, markAsRead, markAllAsRead } = require('../../controllers/client');
const { protect } = require('../../middlewares/auth');
const { isClient } = require('../../middlewares/isClient');

router.use(protect, isClient);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

module.exports = router;

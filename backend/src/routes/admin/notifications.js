const router = require('express').Router();
const { getNotifications, markAsRead, markAllAsRead } = require('../../controllers/admin');
const { protect } = require('../../middlewares/auth');
const { isAdmin } = require('../../middlewares/isAdmin');

router.use(protect, isAdmin);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

module.exports = router;

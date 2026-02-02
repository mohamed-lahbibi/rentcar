const router = require('express').Router();
const { getClients, getClient, toggleBlockClient, verifyClient, getClientReservations } = require('../../controllers/admin');
const { protect } = require('../../middlewares/auth');
const { isAdmin, hasPermission } = require('../../middlewares/isAdmin');
const { MANAGER_PERMISSIONS } = require('../../config/constants');

router.use(protect, isAdmin, hasPermission(MANAGER_PERMISSIONS.MANAGE_CLIENTS));

router.get('/', getClients);
router.get('/:id', getClient);
router.put('/:id/block', toggleBlockClient);
router.put('/:id/verify', verifyClient);
router.get('/:id/reservations', getClientReservations);

module.exports = router;

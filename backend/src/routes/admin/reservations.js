const router = require('express').Router();
const { getReservations, getReservation, updateReservationStatus, getPendingCount, generateContract } = require('../../controllers/admin');
const { protect } = require('../../middlewares/auth');
const { isAdmin, hasPermission } = require('../../middlewares/isAdmin');
const { validate } = require('../../middlewares/validate');
const { reservationStatusSchema } = require('../../validations');
const { MANAGER_PERMISSIONS } = require('../../config/constants');

router.use(protect, isAdmin, hasPermission(MANAGER_PERMISSIONS.MANAGE_RESERVATIONS));

router.get('/', getReservations);
router.get('/pending-count', getPendingCount);
router.get('/:id', getReservation);
router.put('/:id/status', validate(reservationStatusSchema), updateReservationStatus);
router.post('/:id/contract', generateContract);

module.exports = router;

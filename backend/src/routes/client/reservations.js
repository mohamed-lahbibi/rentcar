const router = require('express').Router();
const { getMyReservations, getReservation, createReservation, cancelReservation } = require('../../controllers/client');
const { protect } = require('../../middlewares/auth');
const { isClient } = require('../../middlewares/isClient');
const { validate } = require('../../middlewares/validate');
const { reservationSchema, cancelReservationSchema } = require('../../validations');

router.use(protect, isClient);

router.route('/').get(getMyReservations).post(validate(reservationSchema), createReservation);
router.get('/:id', getReservation);
router.put('/:id/cancel', validate(cancelReservationSchema), cancelReservation);

module.exports = router;

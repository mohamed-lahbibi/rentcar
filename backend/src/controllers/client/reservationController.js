const { Reservation, Car, Settings } = require('../../models');
const { RESERVATION_STATUS, CAR_STATUS } = require('../../config/constants');
const { successResponse, errorResponse, notFoundResponse, createdResponse, parsePagination, paginatedResponse, calculateDays } = require('../../utils');
const { notifyNewReservation } = require('../../services/notificationService');

// @desc    Get my reservations
// @route   GET /api/client/reservations
const getMyReservations = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status } = req.query;
    const filter = { client: req.user._id };
    if (status) filter.status = status;

    const [reservations, total] = await Promise.all([
      Reservation.find(filter).populate('car', 'brand model licensePlate photos dailyPrice').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Reservation.countDocuments(filter)
    ]);
    successResponse(res, 'Reservations retrieved', paginatedResponse(reservations, total, page, limit));
  } catch (error) { next(error); }
};

// @desc    Get single reservation
// @route   GET /api/client/reservations/:id
const getReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findOne({ _id: req.params.id, client: req.user._id })
      .populate('car', 'brand model year licensePlate color fuelType photos dailyPrice');
    if (!reservation) return notFoundResponse(res, 'Reservation');
    successResponse(res, 'Reservation retrieved', reservation);
  } catch (error) { next(error); }
};

// @desc    Create reservation
// @route   POST /api/client/reservations
const createReservation = async (req, res, next) => {
  try {
    if (req.user.isBlocked) return errorResponse(res, 'Your account is blocked', 403);
    if (!req.user.isLicenseValid()) return errorResponse(res, 'Your driving license has expired', 400);

    const car = await Car.findById(req.body.car);
    if (!car || !car.isActive) return notFoundResponse(res, 'Car');
    if (car.status !== CAR_STATUS.AVAILABLE) return errorResponse(res, 'Car is not available', 400);

    const { pickupDate, returnDate } = req.body;
    const conflicting = await Reservation.findOne({
      car: car._id,
      status: { $in: [RESERVATION_STATUS.APPROVED, RESERVATION_STATUS.ACTIVE] },
      $or: [{ pickupDate: { $lte: new Date(returnDate) }, returnDate: { $gte: new Date(pickupDate) } }]
    });
    if (conflicting) return errorResponse(res, 'Car is not available for selected dates', 400);

    const totalDays = calculateDays(pickupDate, returnDate);
    const totalPrice = totalDays * car.dailyPrice;

    const reservation = await Reservation.create({
      client: req.user._id, car: car._id, pickupDate, returnDate,
      totalDays, dailyRate: car.dailyPrice, totalPrice, finalPrice: totalPrice,
      pickupLocation: req.body.pickupLocation, returnLocation: req.body.returnLocation, notes: req.body.notes
    });

    await notifyNewReservation(reservation, req.user, car);
    createdResponse(res, 'Reservation created successfully', reservation);
  } catch (error) { next(error); }
};

// @desc    Cancel reservation
// @route   PUT /api/client/reservations/:id/cancel
const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findOne({ _id: req.params.id, client: req.user._id });
    if (!reservation) return notFoundResponse(res, 'Reservation');
    if (![RESERVATION_STATUS.PENDING, RESERVATION_STATUS.APPROVED].includes(reservation.status)) {
      return errorResponse(res, 'Cannot cancel this reservation', 400);
    }

    reservation.status = RESERVATION_STATUS.CANCELLED;
    reservation.cancellationReason = req.body.reason;
    reservation.cancelledAt = new Date();
    await reservation.save();

    successResponse(res, 'Reservation cancelled successfully');
  } catch (error) { next(error); }
};

module.exports = { getMyReservations, getReservation, createReservation, cancelReservation };

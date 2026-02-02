const { Reservation, Car, Client, Contract, Settings } = require('../../models');
const { RESERVATION_STATUS, CAR_STATUS, NOTIFICATION_TYPES } = require('../../config/constants');
const { successResponse, errorResponse, notFoundResponse, parsePagination, paginatedResponse, calculateDays } = require('../../utils');
const { notifyReservationApproved, notifyReservationRejected, emitReservationUpdate } = require('../../services');
const { sendReservationApprovedEmail, sendReservationRejectedEmail } = require('../../services/emailService');
const { generateContractPDF } = require('../../services/pdfService');

// @desc    Generate contract PDF
// @route   POST /api/admin/reservations/:id/contract
const generateContract = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('client')
      .populate('car');

    if (!reservation) {
      return notFoundResponse(res, 'Reservation');
    }

    if (![RESERVATION_STATUS.APPROVED, RESERVATION_STATUS.ACTIVE, RESERVATION_STATUS.COMPLETED].includes(reservation.status)) {
      return errorResponse(res, 'Contract can only be generated for approved, active or completed reservations', 400);
    }

    // Check if contract already exists
    let contract = await Contract.findOne({ reservation: reservation._id });
    if (contract) {
      return successResponse(res, 'Contract retrieved', contract);
    }

    // Generate new contract
    const contractNumber = `CTR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const settings = await Settings.findOne();
    const contractData = {
      contractNumber,
      clientInfo: {
        name: reservation.client.name,
        email: reservation.client.email,
        phone: reservation.client.phone,
        CIN: reservation.client.CIN || 'N/A',
        drivingLicense: reservation.client.drivingLicense || 'N/A',
        address: reservation.client.address || 'N/A'
      },
      carInfo: {
        brand: reservation.car.brand,
        model: reservation.car.model,
        year: reservation.car.year,
        licensePlate: reservation.car.licensePlate,
        color: reservation.car.color,
        mileage: reservation.kmAtPickup || reservation.car.mileage
      },
      rentalInfo: {
        pickupDate: reservation.pickupDate,
        returnDate: reservation.returnDate,
        pickupLocation: reservation.pickupLocation,
        returnLocation: reservation.returnLocation,
        totalDays: reservation.totalDays,
        dailyRate: reservation.dailyRate,
        totalPrice: reservation.totalPrice
      },
      terms: settings?.contractTerms || 'Standard Terms and Conditions apply.'
    };

    // Generate PDF
    const pdfResult = await generateContractPDF(contractData);

    // Save to DB
    contract = await Contract.create({
      reservation: reservation._id,
      contractNumber,
      url: pdfResult.url,
      publicId: pdfResult.publicId,
      generatedBy: req.user._id
    });

    successResponse(res, 'Contract generated successfully', contract);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reservations
// @route   GET /api/admin/reservations
const getReservations = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status, client, car, fromDate, toDate } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (client) filter.client = client;
    if (car) filter.car = car;
    if (fromDate) filter.pickupDate = { $gte: new Date(fromDate) };
    if (toDate) {
      filter.returnDate = { ...filter.returnDate, $lte: new Date(toDate) };
    }

    const [reservations, total] = await Promise.all([
      Reservation.find(filter)
        .populate('client', 'name email phone photo score')
        .populate('car', 'brand model licensePlate photos dailyPrice')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Reservation.countDocuments(filter)
    ]);

    successResponse(res, 'Reservations retrieved', paginatedResponse(reservations, total, page, limit));
  } catch (error) {
    next(error);
  }
};

// @desc    Get single reservation
// @route   GET /api/admin/reservations/:id
const getReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('client', 'name email phone photo CIN drivingLicense address score')
      .populate('car', 'brand model year licensePlate color fuelType transmission photos dailyPrice mileage')
      .populate('approvedBy', 'name');

    if (!reservation) {
      return notFoundResponse(res, 'Reservation');
    }

    // Get contract if exists
    const contract = await Contract.findOne({ reservation: reservation._id });

    successResponse(res, 'Reservation retrieved', { ...reservation.toObject(), contract });
  } catch (error) {
    next(error);
  }
};

// @desc    Update reservation status
// @route   PUT /api/admin/reservations/:id/status
const updateReservationStatus = async (req, res, next) => {
  try {
    const { status, reason, adminNotes, kmAtPickup, kmAtReturn, fuelAtPickup, fuelAtReturn, extraCharges } = req.body;

    const reservation = await Reservation.findById(req.params.id)
      .populate('client')
      .populate('car');

    if (!reservation) {
      return notFoundResponse(res, 'Reservation');
    }

    const oldStatus = reservation.status;
    
    // Status transition validation
    const validTransitions = {
      [RESERVATION_STATUS.PENDING]: [RESERVATION_STATUS.APPROVED, RESERVATION_STATUS.REJECTED],
      [RESERVATION_STATUS.APPROVED]: [RESERVATION_STATUS.ACTIVE, RESERVATION_STATUS.CANCELLED],
      [RESERVATION_STATUS.ACTIVE]: [RESERVATION_STATUS.COMPLETED],
      [RESERVATION_STATUS.REJECTED]: [],
      [RESERVATION_STATUS.COMPLETED]: [],
      [RESERVATION_STATUS.CANCELLED]: []
    };

    if (!validTransitions[oldStatus].includes(status)) {
      return errorResponse(res, `Cannot change status from ${oldStatus} to ${status}`, 400);
    }

    // Update reservation
    reservation.status = status;
    if (adminNotes) reservation.adminNotes = adminNotes;

    if (status === RESERVATION_STATUS.APPROVED) {
      reservation.approvedBy = req.user._id;
      reservation.approvedByType = req.userType === 'admin' ? 'Admin' : 'Manager';
      reservation.approvedAt = new Date();
      
      // Notify client
      await notifyReservationApproved(reservation, reservation.client, reservation.car);
      await sendReservationApprovedEmail(reservation.client, reservation, reservation.car);
    }

    if (status === RESERVATION_STATUS.REJECTED) {
      reservation.rejectionReason = reason;
      
      // Notify client
      await notifyReservationRejected(reservation, reservation.client, reservation.car, reason);
      await sendReservationRejectedEmail(reservation.client, reservation, reservation.car, reason);
    }

    if (status === RESERVATION_STATUS.ACTIVE) {
      // Car pickup
      reservation.kmAtPickup = kmAtPickup || reservation.car.mileage;
      reservation.fuelAtPickup = fuelAtPickup;
      
      // Update car status
      await Car.findByIdAndUpdate(reservation.car._id, { status: CAR_STATUS.RENTED });
    }

    if (status === RESERVATION_STATUS.COMPLETED) {
      reservation.kmAtReturn = kmAtReturn;
      reservation.fuelAtReturn = fuelAtReturn;
      reservation.actualReturnDate = new Date();
      reservation.extraCharges = extraCharges || 0;
      reservation.finalPrice = reservation.totalPrice + (extraCharges || 0);
      
      // Update car
      await Car.findByIdAndUpdate(reservation.car._id, {
        status: CAR_STATUS.AVAILABLE,
        mileage: kmAtReturn || reservation.car.mileage
      });

      // Update client total reservations
      await Client.findByIdAndUpdate(reservation.client._id, {
        $inc: { totalReservations: 1 }
      });
    }

    if (status === RESERVATION_STATUS.CANCELLED) {
      reservation.cancellationReason = reason;
      reservation.cancelledAt = new Date();
    }

    await reservation.save();

    // Emit real-time update
    emitReservationUpdate(reservation);

    successResponse(res, 'Reservation status updated', reservation);
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending reservations count
// @route   GET /api/admin/reservations/pending-count
const getPendingCount = async (req, res, next) => {
  try {
    const count = await Reservation.countDocuments({ status: RESERVATION_STATUS.PENDING });
    successResponse(res, 'Pending count retrieved', { count });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReservations,
  getReservation,
  updateReservationStatus,
  getPendingCount,
  generateContract
};

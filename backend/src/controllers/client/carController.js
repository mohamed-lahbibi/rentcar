const { Car, Category, Reservation } = require('../../models');
const { CAR_STATUS, RESERVATION_STATUS } = require('../../config/constants');
const { successResponse, notFoundResponse, parsePagination, paginatedResponse } = require('../../utils');

// @desc    Get available cars
// @route   GET /api/client/cars
const getCars = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { category, fuelType, transmission, minPrice, maxPrice, search, pickupDate, returnDate } = req.query;

    const filter = { isActive: true, status: CAR_STATUS.AVAILABLE };
    if (category) filter.category = category;
    if (fuelType) filter.fuelType = fuelType;
    if (transmission) filter.transmission = transmission;
    if (minPrice || maxPrice) {
      filter.dailyPrice = {};
      if (minPrice) filter.dailyPrice.$gte = Number(minPrice);
      if (maxPrice) filter.dailyPrice.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [{ brand: { $regex: search, $options: 'i' } }, { model: { $regex: search, $options: 'i' } }];
    }

    let cars = await Car.find(filter).populate('category', 'name').sort({ dailyPrice: 1 }).skip(skip).limit(limit);

    // Filter by date availability if provided
    if (pickupDate && returnDate) {
      const conflictingCarIds = await Reservation.distinct('car', {
        status: { $in: [RESERVATION_STATUS.APPROVED, RESERVATION_STATUS.ACTIVE] },
        $or: [{ pickupDate: { $lte: new Date(returnDate) }, returnDate: { $gte: new Date(pickupDate) } }]
      });
      cars = cars.filter(car => !conflictingCarIds.some(id => id.equals(car._id)));
    }

    const total = await Car.countDocuments(filter);
    successResponse(res, 'Cars retrieved', paginatedResponse(cars, total, page, limit));
  } catch (error) { next(error); }
};

// @desc    Get single car
// @route   GET /api/client/cars/:id
const getCar = async (req, res, next) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, isActive: true }).populate('category', 'name');
    if (!car) return notFoundResponse(res, 'Car');
    successResponse(res, 'Car retrieved', car);
  } catch (error) { next(error); }
};

// @desc    Get categories
// @route   GET /api/client/cars/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    successResponse(res, 'Categories retrieved', categories);
  } catch (error) { next(error); }
};
// @desc    Get car availability (booked dates)
// @route   GET /api/client/cars/:id/availability
const getCarAvailability = async (req, res, next) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, isActive: true });
    if (!car) return notFoundResponse(res, 'Car');

    // Get reservations for the next 3 months
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeMonthsLater = new Date(today);
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    const reservations = await Reservation.find({
      car: req.params.id,
      status: { $in: [RESERVATION_STATUS.PENDING, RESERVATION_STATUS.APPROVED, RESERVATION_STATUS.ACTIVE] },
      returnDate: { $gte: today },
      pickupDate: { $lte: threeMonthsLater }
    }).select('pickupDate returnDate status');

    // Convert to date ranges
    const bookedRanges = reservations.map(r => ({
      start: r.pickupDate,
      end: r.returnDate,
      status: r.status
    }));

    successResponse(res, 'Availability retrieved', { bookedRanges });
  } catch (error) { next(error); }
};

module.exports = { getCars, getCar, getCategories, getCarAvailability };

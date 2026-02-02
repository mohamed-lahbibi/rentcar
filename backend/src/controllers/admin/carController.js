const { Car, Category, Reservation } = require('../../models');
const { CAR_STATUS, RESERVATION_STATUS } = require('../../config/constants');
const { successResponse, errorResponse, notFoundResponse, createdResponse, parsePagination, paginatedResponse, datesOverlap } = require('../../utils');
const { deleteImages } = require('../../services/uploadService');

// @desc    Get all cars
// @route   GET /api/admin/cars
const getCars = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, status, category, fuelType, transmission, isActive } = req.query;

    const filter = {};
    
    if (search) {
      const searchTerms = search.split(' ').filter(term => term.trim());
      filter.$and = searchTerms.map(term => ({
        $or: [
          { brand: { $regex: term, $options: 'i' } },
          { model: { $regex: term, $options: 'i' } },
          { licensePlate: { $regex: term, $options: 'i' } }
        ]
      }));
    }
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (fuelType) filter.fuelType = fuelType;
    if (transmission) filter.transmission = transmission;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const [cars, total] = await Promise.all([
      Car.find(filter)
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Car.countDocuments(filter)
    ]);

    successResponse(res, 'Cars retrieved', paginatedResponse(cars, total, page, limit));
  } catch (error) {
    next(error);
  }
};

// @desc    Get single car
// @route   GET /api/admin/cars/:id
const getCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id).populate('category', 'name');
    
    if (!car) {
      return notFoundResponse(res, 'Car');
    }

    // Get recent reservations for this car
    const recentReservations = await Reservation.find({ car: car._id })
      .populate('client', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    successResponse(res, 'Car retrieved', { ...car.toObject(), recentReservations });
  } catch (error) {
    next(error);
  }
};

// @desc    Create car
// @route   POST /api/admin/cars
const createCar = async (req, res, next) => {
  try {
    // Check license plate uniqueness
    const existingCar = await Car.findOne({ licensePlate: req.body.licensePlate.toUpperCase() });
    if (existingCar) {
      return errorResponse(res, 'License plate already exists', 400);
    }

    // Verify category exists
    const category = await Category.findById(req.body.category);
    if (!category) {
      return errorResponse(res, 'Invalid category', 400);
    }

    const carData = {
      ...req.body,
      licensePlate: req.body.licensePlate.toUpperCase()
    };

    // Handle photo uploads
    if (req.files && req.files.length > 0) {
      carData.photos = req.files.map(file => ({
        url: file.path,
        publicId: file.filename
      }));
    }

    const car = await Car.create(carData);

    // Update category cars count
    await Category.findByIdAndUpdate(req.body.category, { $inc: { carsCount: 1 } });

    createdResponse(res, 'Car created successfully', car);
  } catch (error) {
    next(error);
  }
};

// @desc    Update car
// @route   PUT /api/admin/cars/:id
const updateCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    
    if (!car) {
      return notFoundResponse(res, 'Car');
    }

    // Check license plate uniqueness if changed
    if (req.body.licensePlate && req.body.licensePlate.toUpperCase() !== car.licensePlate) {
      const existingCar = await Car.findOne({ licensePlate: req.body.licensePlate.toUpperCase() });
      if (existingCar) {
        return errorResponse(res, 'License plate already exists', 400);
      }
    }

    // Handle category change
    if (req.body.category && req.body.category !== car.category.toString()) {
      await Category.findByIdAndUpdate(car.category, { $inc: { carsCount: -1 } });
      await Category.findByIdAndUpdate(req.body.category, { $inc: { carsCount: 1 } });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key === 'licensePlate') {
        car[key] = req.body[key].toUpperCase();
      } else {
        car[key] = req.body[key];
      }
    });

    // Handle photo uploads
    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map(file => ({
        url: file.path,
        publicId: file.filename
      }));
      car.photos = [...car.photos, ...newPhotos];
    }

    await car.save();

    successResponse(res, 'Car updated successfully', car);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete car photo
// @route   DELETE /api/admin/cars/:id/photos/:photoId
const deleteCarPhoto = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    
    if (!car) {
      return notFoundResponse(res, 'Car');
    }

    const photoIndex = car.photos.findIndex(p => p._id.toString() === req.params.photoId);
    if (photoIndex === -1) {
      return notFoundResponse(res, 'Photo');
    }

    const photo = car.photos[photoIndex];
    
    // Delete from Cloudinary
    if (photo.publicId) {
      await deleteImages([photo.publicId]);
    }

    car.photos.splice(photoIndex, 1);
    await car.save();

    successResponse(res, 'Photo deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete car
// @route   DELETE /api/admin/cars/:id
const deleteCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    
    if (!car) {
      return notFoundResponse(res, 'Car');
    }

    // Check for active reservations
    const activeReservation = await Reservation.findOne({
      car: car._id,
      status: { $in: [RESERVATION_STATUS.PENDING, RESERVATION_STATUS.APPROVED, RESERVATION_STATUS.ACTIVE] }
    });

    if (activeReservation) {
      return errorResponse(res, 'Cannot delete car with active reservations', 400);
    }

    // Delete photos from Cloudinary
    const publicIds = car.photos.filter(p => p.publicId).map(p => p.publicId);
    if (publicIds.length > 0) {
      await deleteImages(publicIds);
    }

    // Update category count
    await Category.findByIdAndUpdate(car.category, { $inc: { carsCount: -1 } });

    await car.deleteOne();

    successResponse(res, 'Car deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Check car availability
// @route   POST /api/admin/cars/:id/check-availability
const checkAvailability = async (req, res, next) => {
  try {
    const { pickupDate, returnDate } = req.body;
    const car = await Car.findById(req.params.id);
    
    if (!car) {
      return notFoundResponse(res, 'Car');
    }

    // Check for overlapping reservations
    const conflictingReservation = await Reservation.findOne({
      car: car._id,
      status: { $in: [RESERVATION_STATUS.APPROVED, RESERVATION_STATUS.ACTIVE] },
      $or: [
        { pickupDate: { $lte: new Date(returnDate) }, returnDate: { $gte: new Date(pickupDate) } }
      ]
    });

    successResponse(res, 'Availability checked', {
      available: !conflictingReservation && car.status === CAR_STATUS.AVAILABLE,
      conflictingReservation: conflictingReservation ? {
        pickupDate: conflictingReservation.pickupDate,
        returnDate: conflictingReservation.returnDate
      } : null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCars,
  getCar,
  createCar,
  updateCar,
  deleteCarPhoto,
  deleteCar,
  checkAvailability
};

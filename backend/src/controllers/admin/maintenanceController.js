const { Maintenance, Car } = require('../../models');
const { CAR_STATUS } = require('../../config/constants');
const { successResponse, errorResponse, notFoundResponse, createdResponse, parsePagination, paginatedResponse } = require('../../utils');

// @desc    Get all maintenance records
// @route   GET /api/admin/maintenance
const getMaintenanceRecords = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { car, type, fromDate, toDate } = req.query;

    const filter = {};
    if (car) filter.car = car;
    if (type) filter.type = type;
    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) filter.date.$gte = new Date(fromDate);
      if (toDate) filter.date.$lte = new Date(toDate);
    }

    const [records, total] = await Promise.all([
      Maintenance.find(filter)
        .populate('car', 'brand model licensePlate')
        .populate('createdBy', 'name')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Maintenance.countDocuments(filter)
    ]);

    successResponse(res, 'Maintenance records retrieved', paginatedResponse(records, total, page, limit));
  } catch (error) {
    next(error);
  }
};

// @desc    Get single maintenance record
// @route   GET /api/admin/maintenance/:id
const getMaintenanceRecord = async (req, res, next) => {
  try {
    const record = await Maintenance.findById(req.params.id)
      .populate('car', 'brand model licensePlate year')
      .populate('createdBy', 'name');

    if (!record) {
      return notFoundResponse(res, 'Maintenance record');
    }

    successResponse(res, 'Maintenance record retrieved', record);
  } catch (error) {
    next(error);
  }
};

// @desc    Create maintenance record
// @route   POST /api/admin/maintenance
const createMaintenanceRecord = async (req, res, next) => {
  try {
    const car = await Car.findById(req.body.car);
    if (!car) {
      return errorResponse(res, 'Car not found', 404);
    }

    const recordData = {
      ...req.body,
      createdBy: req.user._id,
      createdByType: req.userType === 'admin' ? 'Admin' : 'Manager'
    };

    // Handle invoice photo upload
    if (req.file) {
      recordData.invoicePhoto = {
        url: req.file.path,
        publicId: req.file.filename
      };
    }

    const record = await Maintenance.create(recordData);

    // Update car's last maintenance info
    car.lastMaintenanceKm = record.kmAtMaintenance;
    car.lastMaintenanceDate = record.date;
    
    // Update car mileage if maintenance km is higher
    if (record.kmAtMaintenance > car.mileage) {
      car.mileage = record.kmAtMaintenance;
    }

    await car.save();

    createdResponse(res, 'Maintenance record created', record);
  } catch (error) {
    next(error);
  }
};

// @desc    Update maintenance record
// @route   PUT /api/admin/maintenance/:id
const updateMaintenanceRecord = async (req, res, next) => {
  try {
    const record = await Maintenance.findById(req.params.id);

    if (!record) {
      return notFoundResponse(res, 'Maintenance record');
    }

    Object.keys(req.body).forEach(key => {
      record[key] = req.body[key];
    });

    if (req.file) {
      record.invoicePhoto = {
        url: req.file.path,
        publicId: req.file.filename
      };
    }

    await record.save();

    successResponse(res, 'Maintenance record updated', record);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete maintenance record
// @route   DELETE /api/admin/maintenance/:id
const deleteMaintenanceRecord = async (req, res, next) => {
  try {
    const record = await Maintenance.findById(req.params.id);

    if (!record) {
      return notFoundResponse(res, 'Maintenance record');
    }

    await record.deleteOne();

    successResponse(res, 'Maintenance record deleted');
  } catch (error) {
    next(error);
  }
};

// @desc    Get cars needing maintenance
// @route   GET /api/admin/maintenance/due
const getCarsDueForMaintenance = async (req, res, next) => {
  try {
    const cars = await Car.find({
      isActive: true,
      $expr: {
        $gte: [
          { $subtract: ['$mileage', '$lastMaintenanceKm'] },
          '$maintenanceThreshold'
        ]
      }
    }).select('brand model licensePlate mileage lastMaintenanceKm maintenanceThreshold lastMaintenanceDate');

    successResponse(res, 'Cars due for maintenance', cars);
  } catch (error) {
    next(error);
  }
};

// @desc    Get maintenance history for a car
// @route   GET /api/admin/maintenance/car/:carId
const getCarMaintenanceHistory = async (req, res, next) => {
  try {
    const records = await Maintenance.find({ car: req.params.carId })
      .sort({ date: -1 });

    const totalCost = records.reduce((sum, r) => sum + r.cost, 0);

    successResponse(res, 'Car maintenance history', {
      records,
      totalCost,
      totalRecords: records.length
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMaintenanceRecords,
  getMaintenanceRecord,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
  getCarsDueForMaintenance,
  getCarMaintenanceHistory
};

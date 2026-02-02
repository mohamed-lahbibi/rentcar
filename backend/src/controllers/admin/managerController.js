const { Manager } = require('../../models');
const { successResponse, errorResponse, notFoundResponse, createdResponse, parsePagination, paginatedResponse } = require('../../utils');

// @desc    Get all managers
// @route   GET /api/admin/managers
const getManagers = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, isActive } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const [managers, total] = await Promise.all([
      Manager.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Manager.countDocuments(filter)
    ]);

    successResponse(res, 'Managers retrieved', paginatedResponse(managers, total, page, limit));
  } catch (error) {
    next(error);
  }
};

// @desc    Get single manager
// @route   GET /api/admin/managers/:id
const getManager = async (req, res, next) => {
  try {
    const manager = await Manager.findById(req.params.id).select('-password');
    
    if (!manager) {
      return notFoundResponse(res, 'Manager');
    }

    successResponse(res, 'Manager retrieved', manager);
  } catch (error) {
    next(error);
  }
};

// @desc    Create manager
// @route   POST /api/admin/managers
const createManager = async (req, res, next) => {
  try {
    // Check if email exists
    const existingManager = await Manager.findOne({ email: req.body.email });
    if (existingManager) {
      return errorResponse(res, 'Email already exists', 400);
    }

    const manager = await Manager.create({
      ...req.body,
      createdBy: req.user._id
    });

    createdResponse(res, 'Manager created successfully', {
      id: manager._id,
      name: manager.name,
      email: manager.email,
      permissions: manager.permissions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update manager
// @route   PUT /api/admin/managers/:id
const updateManager = async (req, res, next) => {
  try {
    const manager = await Manager.findById(req.params.id);
    
    if (!manager) {
      return notFoundResponse(res, 'Manager');
    }

    // If updating email, check if it's unique
    if (req.body.email && req.body.email !== manager.email) {
      const existingManager = await Manager.findOne({ email: req.body.email });
      if (existingManager) {
        return errorResponse(res, 'Email already exists', 400);
      }
    }

    // Update fields
    const allowedFields = ['name', 'email', 'phone', 'permissions', 'isActive'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        manager[field] = req.body[field];
      }
    });

    // Update password if provided
    if (req.body.password) {
      manager.password = req.body.password;
    }

    await manager.save();

    successResponse(res, 'Manager updated successfully', {
      id: manager._id,
      name: manager.name,
      email: manager.email,
      permissions: manager.permissions,
      isActive: manager.isActive
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete manager
// @route   DELETE /api/admin/managers/:id
const deleteManager = async (req, res, next) => {
  try {
    const manager = await Manager.findById(req.params.id);
    
    if (!manager) {
      return notFoundResponse(res, 'Manager');
    }

    await manager.deleteOne();

    successResponse(res, 'Manager deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getManagers,
  getManager,
  createManager,
  updateManager,
  deleteManager
};

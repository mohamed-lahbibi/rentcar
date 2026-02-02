const { Category, Car } = require('../../models');
const { successResponse, errorResponse, notFoundResponse, createdResponse, parsePagination, paginatedResponse } = require('../../utils');
const { deleteImage } = require('../../services/uploadService');

// @desc    Get all categories
// @route   GET /api/admin/categories
const getCategories = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { isActive } = req.query;

    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const [categories, total] = await Promise.all([
      Category.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
      Category.countDocuments(filter)
    ]);

    // Get car counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const carsCount = await Car.countDocuments({ category: cat._id, isActive: true });
        return { ...cat.toObject(), carsCount };
      })
    );

    successResponse(res, 'Categories retrieved', paginatedResponse(categoriesWithCounts, total, page, limit));
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category
// @route   GET /api/admin/categories/:id
const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return notFoundResponse(res, 'Category');
    }

    const carsCount = await Car.countDocuments({ category: category._id, isActive: true });

    successResponse(res, 'Category retrieved', { ...category.toObject(), carsCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/admin/categories
const createCategory = async (req, res, next) => {
  try {
    const existingCategory = await Category.findOne({ name: req.body.name });
    if (existingCategory) {
      return errorResponse(res, 'Category name already exists', 400);
    }

    const category = await Category.create(req.body);

    // Handle icon upload if file provided
    if (req.file) {
      category.icon = req.file.path;
      await category.save();
    }

    createdResponse(res, 'Category created successfully', category);
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return notFoundResponse(res, 'Category');
    }

    // Check for duplicate name
    if (req.body.name && req.body.name !== category.name) {
      const existingCategory = await Category.findOne({ name: req.body.name });
      if (existingCategory) {
        return errorResponse(res, 'Category name already exists', 400);
      }
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      category[key] = req.body[key];
    });

    // Handle icon upload
    if (req.file) {
      // Delete old icon if exists
      if (category.icon) {
        const publicId = category.icon.split('/').slice(-2).join('/').split('.')[0];
        await deleteImage(publicId);
      }
      category.icon = req.file.path;
    }

    await category.save();

    successResponse(res, 'Category updated successfully', category);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return notFoundResponse(res, 'Category');
    }

    // Check if category has cars
    const carsCount = await Car.countDocuments({ category: category._id });
    if (carsCount > 0) {
      return errorResponse(res, 'Cannot delete category with associated cars', 400);
    }

    // Delete icon if exists
    if (category.icon) {
      const publicId = category.icon.split('/').slice(-2).join('/').split('.')[0];
      await deleteImage(publicId);
    }

    await category.deleteOne();

    successResponse(res, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};

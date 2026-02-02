const router = require('express').Router();
const { getCategories, getCategory, createCategory, updateCategory, deleteCategory } = require('../../controllers/admin');
const { protect } = require('../../middlewares/auth');
const { isAdmin } = require('../../middlewares/isAdmin');
const { uploadUserPhoto } = require('../../middlewares/upload');
const { validate } = require('../../middlewares/validate');
const { categorySchema } = require('../../validations');

router.use(protect, isAdmin);

router.route('/').get(getCategories).post(uploadUserPhoto.single('icon'), validate(categorySchema), createCategory);
router.route('/:id').get(getCategory).put(uploadUserPhoto.single('icon'), updateCategory).delete(deleteCategory);

module.exports = router;

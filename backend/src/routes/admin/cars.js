const router = require('express').Router();
const { getCars, getCar, createCar, updateCar, deleteCar, deleteCarPhoto, checkAvailability } = require('../../controllers/admin');
const { protect } = require('../../middlewares/auth');
const { isAdmin, hasPermission } = require('../../middlewares/isAdmin');
const { uploadCarPhotos } = require('../../middlewares/upload');
const { validate } = require('../../middlewares/validate');
const { carSchema } = require('../../validations');
const { MANAGER_PERMISSIONS } = require('../../config/constants');

router.use(protect, isAdmin, hasPermission(MANAGER_PERMISSIONS.MANAGE_CARS));

router.route('/').get(getCars).post(uploadCarPhotos.array('photos', 10), validate(carSchema), createCar);
router.route('/:id').get(getCar).put(uploadCarPhotos.array('photos', 10), updateCar).delete(deleteCar);
router.delete('/:id/photos/:photoId', deleteCarPhoto);
router.post('/:id/check-availability', checkAvailability);

module.exports = router;

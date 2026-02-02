const router = require('express').Router();
const { getMaintenanceRecords, getMaintenanceRecord, createMaintenanceRecord, updateMaintenanceRecord, deleteMaintenanceRecord, getCarsDueForMaintenance, getCarMaintenanceHistory } = require('../../controllers/admin');
const { protect } = require('../../middlewares/auth');
const { isAdmin, hasPermission } = require('../../middlewares/isAdmin');
const { uploadDocument } = require('../../middlewares/upload');
const { validate } = require('../../middlewares/validate');
const { maintenanceSchema } = require('../../validations');
const { MANAGER_PERMISSIONS } = require('../../config/constants');

router.use(protect, isAdmin, hasPermission(MANAGER_PERMISSIONS.MANAGE_MAINTENANCE));

router.get('/due', getCarsDueForMaintenance);
router.get('/car/:carId', getCarMaintenanceHistory);
router.route('/').get(getMaintenanceRecords).post(uploadDocument.single('invoice'), validate(maintenanceSchema), createMaintenanceRecord);
router.route('/:id').get(getMaintenanceRecord).put(uploadDocument.single('invoice'), updateMaintenanceRecord).delete(deleteMaintenanceRecord);

module.exports = router;

const router = require('express').Router();
const { getManagers, getManager, createManager, updateManager, deleteManager } = require('../../controllers/admin');
const { protect } = require('../../middlewares/auth');
const { isSuperAdmin } = require('../../middlewares/isAdmin');
const { validate } = require('../../middlewares/validate');
const { managerSchema } = require('../../validations');

router.use(protect, isSuperAdmin);

router.route('/').get(getManagers).post(validate(managerSchema), createManager);
router.route('/:id').get(getManager).put(validate(managerSchema), updateManager).delete(deleteManager);

module.exports = router;

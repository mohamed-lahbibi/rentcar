const router = require('express').Router();
const { getDashboard } = require('../../controllers/admin');
const { protect } = require('../../middlewares/auth');
const { isAdmin } = require('../../middlewares/isAdmin');

router.get('/', protect, isAdmin, getDashboard);

module.exports = router;

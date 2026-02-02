const router = require('express').Router();
const { getCars, getCar, getCategories, getCarAvailability } = require('../../controllers/client');

router.get('/categories', getCategories);
router.get('/', getCars);
router.get('/:id/availability', getCarAvailability);
router.get('/:id', getCar);

module.exports = router;

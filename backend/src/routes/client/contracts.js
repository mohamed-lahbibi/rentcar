const router = require('express').Router();
const { getMyContracts, getContract, signContract } = require('../../controllers/client');
const { protect } = require('../../middlewares/auth');
const { isClient } = require('../../middlewares/isClient');

router.use(protect, isClient);

router.get('/', getMyContracts);
router.get('/:id', getContract);
router.put('/:id/sign', signContract);

module.exports = router;

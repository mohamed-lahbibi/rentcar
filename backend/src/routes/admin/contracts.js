const router = require('express').Router();
const { getContracts, getContract, generateContract, regeneratePDF, signContract } = require('../../controllers/admin');
const { protect } = require('../../middlewares/auth');
const { isAdmin } = require('../../middlewares/isAdmin');

router.use(protect, isAdmin);

router.get('/', getContracts);
router.get('/:id', getContract);
router.post('/generate/:reservationId', generateContract);
router.post('/:id/regenerate-pdf', regeneratePDF);
router.put('/:id/sign', signContract);

module.exports = router;

const router = require('express').Router();
const { addScore, getClientScores } = require('../../controllers/admin');
const { protect } = require('../../middlewares/auth');
const { isAdmin } = require('../../middlewares/isAdmin');
const { validate } = require('../../middlewares/validate');
const { clientScoreSchema } = require('../../validations');

router.use(protect, isAdmin);

router.post('/', validate(clientScoreSchema), addScore);
router.get('/:clientId', getClientScores);

module.exports = router;

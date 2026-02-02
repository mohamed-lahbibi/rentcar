const router = require('express').Router();
const { getConversations, getConversationMessages, startConversation, sendMessage } = require('../../controllers/admin');
const { protect } = require('../../middlewares/auth');
const { isAdmin } = require('../../middlewares/isAdmin');
const { uploadMessageImages } = require('../../middlewares/upload');

router.use(protect, isAdmin);

router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversationMessages);
router.post('/conversations', startConversation);
router.post('/send', uploadMessageImages.array('images', 5), sendMessage);

module.exports = router;

const router = require('express').Router();
const { getConversations, getConversationMessages, startConversation, sendMessage } = require('../../controllers/client');
const { protect } = require('../../middlewares/auth');
const { isClient } = require('../../middlewares/isClient');
const { uploadMessageImages } = require('../../middlewares/upload');

router.use(protect, isClient);

router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversationMessages);
router.post('/conversations', startConversation);
router.post('/send', uploadMessageImages.array('images', 5), sendMessage);

module.exports = router;

const checkAuth = require('../middlewares/check-auth');
const express = require("express");
const router = express.Router();

const ConversationController = require('../controllers/conversationController');

router.post('/',checkAuth,ConversationController.createConversation)
router.get('/',checkAuth,ConversationController.getUserConversation);

module.exports = router;

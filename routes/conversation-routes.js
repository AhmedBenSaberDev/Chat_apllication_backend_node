const checkAuth = require('../middlewares/check-auth');
const express = require("express");
const router = express.Router();

const ConversationController = require('../controllers/conversationController');

router.post('/',checkAuth,ConversationController.createConversation)


module.exports = router;

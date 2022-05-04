const checkAuth = require('../middlewares/check-auth');
const express = require("express");
const router = express.Router();

const MessageController = require('../controllers/messageController');

router.post('/',checkAuth,MessageController.createMessage);
router.get('/:conversationId',checkAuth,MessageController.getMessages);


module.exports = router;

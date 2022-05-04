const express = require("express");

const imageUpload = require('../middlewares/file-upload');

const router = express.Router();

const userController = require('../controllers/userController');

const checkAuth = require('../middlewares/check-auth');

// user authentification
router.post('/signup',imageUpload.single('image'),userController.singup);
router.post('/login',userController.login);
router.post('/google_auth',userController.googleAuth);

// Add | Accept | Decline users requests
router.get('/search_user/:searchTerm',checkAuth,userController.searchUser);
router.post('/add_user',checkAuth,userController.sendAddFriendRequest);
router.post('/accept_friend_request',checkAuth,userController.acceptFriendRequest);
router.post('/decline_friend_request',checkAuth,userController.declineFriendRequest);


// user info
router.post('/user-info',checkAuth,userController.getUserInfo);

module.exports = router;
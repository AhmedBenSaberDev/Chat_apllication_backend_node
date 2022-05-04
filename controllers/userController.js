const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const mongoose = require('mongoose');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const { UserModel, validateUser } = require("../models/user-model");

module.exports.singup = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    await validateUser(req.body);
  } catch (error) {
    return res.status(403).json({ errors: error.details });
  }

  let hashedPassword;

  //   password hash
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    return res.status(500).json({ message: "An error occured" });
  }

  let user;
  let newUserCredentials;

  if (req.file !== undefined) {
    newUserCredentials = {
      userName,
      email,
      password: hashedPassword,
      image: req.file.path,
    };
  } else {
    newUserCredentials = { userName, email, password: hashedPassword };
  }

  try {
    user = new UserModel(newUserCredentials);
    await user.save();
  } catch (error) {
    if (error.message == "This email already exists") {
      return res.status(400).json({ email: "This email already exists" });
    }
    return res.status(500).json({ message: "An error occured" });
  }

  return res.json({ user });
};

module.exports.login = async (req, res) => {

  const {email , password } = req.body;

  let user;
  try {
    user = await UserModel.findOne({email:email});     
  } catch (error) {
    return res.status(500).json({message:"An error occured"});
  }

  if(!user){
    return res.status(401).json({message:"Invalid email or password"});
  }

  let passwordVerified = false;

    // password verification

    passwordVerified = await bcrypt.compare(password,user.password);

    if(!passwordVerified){
        return res.status(401).json({message:"Invalid email or password"});
    }

    // generating user token

    let token;

    try {
        token = await jwt.sign({
            userId:user._id,
            email:user.email
        },process.env.JSON_CRYPTO_KEY)
    } catch (err) {
        return res.status(500).json({message:"An error occured"});
    }

   return res.json({userId:user._id,email:user.email,token:token,friendRequests:user.friendRequests});

};

module.exports.googleAuth = async (req,res) => {
    const { tokenId } = req.body;

    try {
        const response = await client.verifyIdToken({idToken:tokenId , audience:process.env.GOOGLE_CLIENT_ID});
        const {email , email_verified , name} = response.payload;

        if(email_verified){

            UserModel.findOne({email}).exec((error,user) => {
                if(error){
                    return res.status(500).json({message:"An error occured"})
                }
                if(user){
                    const token =  jwt.sign({
                        userId:user.id,
                        email:user.email
                    },process.env.JSON_CRYPTO_KEY)
                    return res.json({userId:user.id,email:user.email,token:token,friendRequests:user.friendRequests});
                }else{
                    let password = email + process.env.JSON_CRYPTO_KEY;
                    let newUser = new UserModel({
                        userName:name,
                        password,
                        email
                    });

                    newUser.save((err,data) => {
                        if(err){
                            return res.status(500).json({message:"An error occured"})
                        }else{
                            const token =  jwt.sign({
                                userId:data.id,
                                email:data.email
                            },process.env.JSON_CRYPTO_KEY)
                            return res.json({userId:data.id,email:data.email,token:token,friendRequests:newUser.friendRequests});
                        }
                    })
                }
            })
        }
    } catch (error) {
        return res.status(500).json({message:"An error occured"})
    }
}

module.exports.getUserInfo = async (req,res) => {

  const {userId} = req.body;
  
  try {
    const user = await UserModel.findById(userId).populate("friendRequests").populate('friends');  
    return res.json(user);
  } catch (error) {
    return res.status(500).json({message:"An error occured please try again"})
  }
}

module.exports.searchUser = async (req,res) => {
  
  let searchTerm = req.params.searchTerm;
  let user;
  let users;


  try {
    user = await UserModel.findById(req.userData.userId);
  } catch (error) {
    return res.status(500).json({message:"An error occured"});
  }

  try {
    if(user.friends){
      users = await UserModel.find({userName:{$regex:searchTerm,$options: 'i'}}).find({_id: { $ne: user._id}}).select('-password');
      
    }else{
      users = await UserModel.find({userName:{$regex:searchTerm,$options: 'i'}}).find({$and:[{_id: { $ne: user.friends}} , {_id: { $ne: user._id}}]}).select('-password');   
    }
    
  } catch (error) {
    console.log(error);
  }


  if(!users){
    return res.json({message:"No users found"});
  }

  const usersList = users.filter(friend => !user.friends.includes(friend._id));
  return res.json(usersList);

}

module.exports.sendAddFriendRequest = async (req,res) => {
  
  const {requestToId} = req.body;

  let user;

  try {
    user = await UserModel.findById(requestToId);
  } catch (error) {
    return res.json({message:"An error occured"})
  }

  if(user.friends.includes(requestToId)){
    return res.status(422).json({message:"This user is already in friends"})
  }

  if(user.friendRequests.includes(req.userData.userId)){
    return res.status(422).json({message:"A request has been already sent"})
  }

  try {
    user.friendRequests.push(req.userData.userId);
    await user.save();
  } catch (error) {
    return res.json({message:"An error occured"})
  }

  return res.json({message:"Request sent"});
}

module.exports.acceptFriendRequest = async (req,res)=>{

  let user;
  let {senderId} = req.body;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    user = await UserModel.findByIdAndUpdate(req.userData.userId, { $push:{friends:senderId},$pull:{friendRequests:senderId} },{session:sess});
    await UserModel.findByIdAndUpdate(senderId, { $push:{friends:req.userData.userId},$pull:{friendRequests:req.userData.userId} },{session:sess});

    await sess.commitTransaction();
  } catch (error) {
    console.log(error);
    return res.status(500).json({message:"An error occured"})
  }

  res.json({message:user})
}

module.exports.declineFriendRequest = async (req,res) =>{
  let user;
  let {senderId} = req.body;

  try {
    user = await UserModel.findByIdAndUpdate(req.userData.userId, { $pull:{friendRequests:senderId} });
  } catch (error) {
    return res.status(500).json({message:"An error occured"})
  }

  res.json({message:user})
}
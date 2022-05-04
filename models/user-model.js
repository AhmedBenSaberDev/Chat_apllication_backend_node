const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const joi = require('joi');
const passwordComplexity = require('joi-password-complexity');
require('dotenv').config();

const userSchema = new Schema({

    userName:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    image:{type:String,required:true,default:"https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"},
    friends:[{type:mongoose.SchemaTypes.ObjectId,ref:'User'}],
    friendRequests:[{type:mongoose.SchemaTypes.ObjectId,ref:'User'}],
    verified:{type:Boolean,default:false}
});

// Check email is unique
userSchema.post('save', function (error,doc,next){
    if (error.name === 'MongoServerError' && error.code === 11000) {
        next(new Error('This email already exists'));
      } else {
        next(error);
      }
});

// User validations
const validateUser = (data) => {
    
    const Schema = joi.object({
        userName:joi.string().required().label('First Name'),
        image:joi.string().label('Image'),
        email:joi.string().required().email().label('Email'),
        password:passwordComplexity().required().label('Password'),
        passwordConfirm: joi.any().equal(joi.ref('password')).required().label('Confirm password').messages({ 'any.only': 'passwords does not match' })
    });

    return Schema.validateAsync(data,{ abortEarly: false });
}


const UserModel =  mongoose.model('User',userSchema);
module.exports = {UserModel,validateUser};
const mongoose = require('mongoose');

const MessageShema = new mongoose.Schema({
    conversationId:{type:mongoose.SchemaTypes.ObjectId,ref:"Conversation"},
    senderId:{type:mongoose.SchemaTypes.ObjectId,ref:'User'},
    content:{type:String}
},
{
    timestamps:true
});

const MessageModel = mongoose.model('Message',MessageShema);

module.exports =  MessageModel;
const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    members:[{type:mongoose.SchemaTypes.ObjectId,ref:'User'}]
},
{
    timestamps:true
});

const ConversationModel = mongoose.model('Conversation',ConversationSchema);

module.exports =  ConversationModel;
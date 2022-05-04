const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    users:[{type:mongoose.SchemaTypes.ObjectId,ref:'User'}]
},
{
    timestamps:true
});

const ConversationModel = mongoose.model('Conversation',ConversationSchema);

export default ConversationModel;
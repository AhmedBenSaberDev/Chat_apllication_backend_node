const { json } = require('express/lib/response');
const ConversatioModel = require('../models/conversation-model');


module.exports.createConversation = async (req,res) =>{

    const conversation = new ConversatioModel({
        members:[req.userData.userId,req.body.receiverId]
    });

    try {
        await conversation.save();
    } catch (error) {
        return res.status(500).json({message:'An error occured , Please try again later'});
    }

    return res.json(conversation);
}

module.exports.getUserConversation = async (req,res) => {
    
    try {
        const conversations = await ConversatioModel.find({
            members:{$in:[req.userData.userId]}
        });
        return res.json(conversations);
    } catch (error) {
        return res.status(500).json({message:'An error occured , Please try again later'});
    }
}
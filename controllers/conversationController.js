const ConversatioModel = require('../models/conversation-model');


module.exports.createConversation = async (req,res) =>{

    let existingConversation;

    try {
        existingConversation = await ConversatioModel.find({});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'An error occured , Please try again later'});
    }

    existingConversation = existingConversation.filter(c => c.members.includes(req.userData.userId) && c.members.includes(req.body.receiverId)  )

    if(existingConversation.length > 0){
        return res.json({message:"There is already an instance of this conversation",existingConversation})
    }

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
        }).populate('members',"-password");
        return res.json(conversations);
    } catch (error) {
        return res.status(500).json({message:'An error occured , Please try again later'});
    }
}
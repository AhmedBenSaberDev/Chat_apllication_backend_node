const MessageModel = require('../models/messsage-model');


module.exports.createMessage = async (req,res) =>{

    const message = new MessageModel({
        conversationId:req.body.conversationId,
        content:req.body.content,
        senderId:req.body.senderId
    });

    try {
        await message.save();
        return res.json(message);
    } catch (error) {
        return res.status(500).json({message:'An error occured , Please try again later'});
    }

}

module.exports.getMessages = async (req,res) => {
    try {
        const messages = await MessageModel.find({
            conversartionId:req.params.conversationId
        });
        return res.json(messages);
    } catch (error) {
        return res.status(500).json({message:'An error occured , Please try again later'});
    }
}
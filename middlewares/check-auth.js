const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req,res,next) => {
    try {
        let token = req.headers.authorization.split(' ')[1];
        if(!token){
            return res.status(500).json({message:"Authentification failed"})
        }
        const decodedToken = jwt.verify(token,process.env.JSON_CRYPTO_KEY)
        req.userData = {userId:decodedToken.userId}
        next()
    } catch (err) {
        return res.status(500).json({message:"Authentification failed"})

    }
}
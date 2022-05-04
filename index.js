require('dotenv').config({path:'./config/.env'});

// Import db connection 
require('./config/db');

const fs = require('fs');

const bodyParser = require('body-parser');
const cors = require("cors");

// User routes
const userRoutes = require('./routes/user-routes');

// Conversation routes
const conversationRoutes = require('./routes/conversation-routes');

// message routes
const messageRoutes = require('./routes/message-routes');

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server)

app.use(bodyParser.json());
app.use(cors({
    origin:process.env.CLIENT
}))

// user routes
app.use('/api/user',userRoutes);

// Conversation routes
app.use('/api/conversation',conversationRoutes);

// message routes
app.use('/api/message',messageRoutes);

app.use((req,res,next) => {
    return res.status(404).json({message:"Route not found"})
});

app.use((req,res,next) => {
    if(req.file){
        fs.unlink(req.file.path, err => {
            console.log(err);
        })
    }
});

server.listen(process.env.PORT,() => {
    console.log("Server listening on port 5000");
});


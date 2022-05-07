require('dotenv').config({path:'./config/.env'});

// Import db connection 
require('./config/db');

const fs = require('fs');
const path = require('path');

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

app.use(bodyParser.json());
app.use('/uploads/images',express.static(path.join('uploads','images')))

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

// socket

const io = require('socket.io')(server,{
    cors:{
        origin:"http://localhost:3000"
    },
    pingTimeout:60000
});

io.on('connection',(socket)=>{

    socket.on('setup',(userId) => {
        console.log(userId);
        socket.join(userId);
        socket.emit('connected');
    });

    socket.on('join chat',(roomId) => {
        socket.join(roomId);
        console.log("user joinded rooom " + roomId);
    });

    socket.on('new message',(data) => {
        socket.in(data.receiverId).emit("message recieved",{senderId:data.senderId,message:data.message});
    });

    socket.on('typing',(data)=>{
        socket.in(data.recieverId).emit('typing',{recieverId:data.recieverId,conversationId:data.conversationId})
    });

    socket.on('stop typing',(data)=>{
        socket.in(data.recieverId).emit('stop typing',{recieverId:data.recieverId,conversationId:data.conversationId})
    });

    socket.on("calluser",({userToCall,signalData,from}) =>{
        console.log(userToCall,signalData);
        // socket.in(userToCall).emit("callUser", { signal: signalData, from })
        socket.in(userToCall).emit("test");
    })

    socket.on('answercall',(data) => {
        socket.in(data.to).emit("callaccepted",data.signal)
    })
});


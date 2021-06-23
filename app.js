const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const mongoose = require('mongoose')
const formatMessage = require('./utils/messages');
const { userJoin, userLeave, getCurrentUser, getRoomUsers } = require('./utils/users');

const app = express();
require('dotenv').config()



app.use(express.static(path.resolve('./public')))

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.dataBase, { useNewUrlParser: true, useUnifiedTopology: true })
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const io = socketio(server);


app.get('/', (req, res, next) => {

    res.sendFile(path.resolve('./html/index.html'))

})

app.get('/chat', (req, res, next) => {

    res.sendFile(path.resolve('./html/chat.html'))

})

const botName = 'BytChat Bot'
io.on('connection', socket => {



    socket.on('joinRoom', ({ username, room }) => {

        const user = userJoin(socket.id, username, room)
        socket.join(user.room)
        /// welcome
        socket.emit('message', formatMessage(botName, 'welcome To BytChat'))

        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${username} has joind the chat`))


        //Send users and room info 
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })


    /// Listn for ChatMessage
    socket.on('chatMessage', message => {
        io.emit('message', formatMessage('sajjad', message))
    })

    socket.on('disconnect', () => {
        const user = userLeave(socket.id)
        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the Chat...`))
            //Send users and room info 
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })

})


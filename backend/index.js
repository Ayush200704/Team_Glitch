const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const userMap = {};
const roomUsers = {};
const sessionHosts = {};



io.on('connection', (socket) => {
    console.log('New user:', socket.id);

    socket.on('join-room', ({ roomId, username, isHost }) => {
        socket.join(roomId);
        userMap[socket.id] = { username, roomId };

        // Mark host
        if (isHost) {
            sessionHosts[roomId] = socket.id;
        }

        // Add to user list
        if (!roomUsers[roomId]) roomUsers[roomId] = [];
        roomUsers[roomId].push({ username, socketId: socket.id });

        // Send updated chat
        io.to(roomId).emit('chat-message', {
            username: 'System',
            message: `${username} joined the room.`,
        });

        // Broadcast updated user list
        io.to(roomId).emit('user-list', roomUsers[roomId]);
    });

    socket.on('chat-message', ({ roomId, username, message }) => {
        io.to(roomId).emit('chat-message', { username, message, timestamp: Date.now() });
    });

    socket.on('select-movie', ({ roomId, movieUrl }) => {
        io.to(roomId).emit('load-movie', movieUrl);
    });

    socket.on('play', ({ roomId, time }) => {
        socket.to(roomId).emit('play', time);
    });

    socket.on('pause', ({ roomId, time }) => {
        socket.to(roomId).emit('pause', time);
    });

    socket.on('seek', ({ roomId, time }) => {
        socket.to(roomId).emit('seek', time);
    });

    socket.on('rate-change', ({ roomId, rate }) => {
        socket.to(roomId).emit('rate-change', { rate });
    });

    socket.on('emoji-reaction', ({ roomId, emoji, username }) => {
        io.to(roomId).emit('emoji-reaction', { emoji, username });
    });


    socket.on('leave-room', ({ roomId }) => {
        const user = userMap[socket.id];
        if (!user) return;

        const username = user.username;
        const isHostLeaving = sessionHosts[roomId] === socket.id;

        // Remove user
        socket.leave(roomId);
        delete userMap[socket.id];
        roomUsers[roomId] = roomUsers[roomId]?.filter(u => u.socketId !== socket.id);

        // Notify others
        io.to(roomId).emit('chat-message', {
            username: 'System',
            message: `${username} left the room.`,
        });

        io.to(roomId).emit('user-list', roomUsers[roomId]);

        // Optional: if host leaves, close the room for everyone
        if (isHostLeaving) {
            io.to(roomId).emit('force-leave');
            delete sessionHosts[roomId];
        }
    });


    socket.on('disconnect', () => {
        const user = userMap[socket.id];
        if (!user) return;

        const { roomId, username } = user;

        // Remove from roomUsers
        if (roomUsers[roomId]) {
            roomUsers[roomId] = roomUsers[roomId].filter(u => u.socketId !== socket.id);
        }

        // Notify room
        io.to(roomId).emit('chat-message', {
            username: 'System',
            message: `${username} left the room.`,
        });

        // Send updated user list
        io.to(roomId).emit('user-list', roomUsers[roomId]);

        delete userMap[socket.id];
    });
});

server.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});

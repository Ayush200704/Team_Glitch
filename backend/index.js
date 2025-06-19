import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import { groqApiCall } from './llm_utils.js'; // You need to implement this

const app = express();
app.use(cors());
app.use(express.json());
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

app.post('/api/ai-recommend', async (req, res) => {
    const { customPrompt, ...preferences } = req.body;
    const movies = JSON.parse(fs.readFileSync('./making movie json/movies_random_names.json', 'utf-8'));

    let prompt = '';
    // If customPrompt is provided, check if it's related to movie recommendations
    if (customPrompt && customPrompt.trim()) {
        const lowerPrompt = customPrompt.toLowerCase();
        if (!lowerPrompt.includes('recommend') && !lowerPrompt.includes('suggest') && !lowerPrompt.includes('movie')) {
            return res.json({ recommendations: [{ name: "Your prompt does not appear to be a movie recommendation request. Please ask for movie recommendations.", genre: [] }] });
        }
        prompt = `
    
${customPrompt}
Return ONLY a JSON array of 5 objects, each with "name" and "genre" fields. Do not include any explanation, markdown, or extra text.`;
    } else {
        prompt = `
Given the following user preferences: ${JSON.stringify(preferences)}
and the following movies: ${JSON.stringify(movies).slice(0, 10000)}
Recommend 5 movies that best match the preferences.
Return ONLY a JSON array of 5 objects, each with "name" and "genre" fields. Do not include any explanation, markdown, or extra text.`;
    }

    // Call your LLM API (Groq or Gemini)
    let recommendations = [];
    try {
        const llmResponse = await groqApiCall(prompt);
        console.log("LLM Response:", llmResponse);
        recommendations = JSON.parse(llmResponse);
    } catch (e) {
        console.error("AI Recommendation Error:", e);
        recommendations = [{ name: "AI failed to recommend movies.", genre: [] }];
    }

    res.json({ recommendations });
});

server.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});

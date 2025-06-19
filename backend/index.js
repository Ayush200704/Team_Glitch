import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import { groqApiCall } from './llm_utils.js'; // You need to implement this
import path from 'path';


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
const sceneChunks = {};
const roomSceneTimers = {};
const sceneInteractionResults = {};
const roomVideoStates = {}; // Track video state for each room

fs.readdirSync('C:/Personal/HackOn Amazon/intell/app/outputs/scene_contexts/Before Midnight').forEach(file => {
    if (file.endsWith('.json')) {
        const chunk = JSON.parse(fs.readFileSync(path.join('C:/Personal/HackOn Amazon/intell/app/outputs/scene_contexts/Before Midnight', file), 'utf-8'));
        sceneChunks[chunk.scene] = chunk;
    }
});


function getRandomType() {
    const types = ['trivia', 'fun_fact', 'poll'];
    return types[Math.floor(Math.random() * types.length)];
}

function clearRoomTimers(roomId) {
    if (roomSceneTimers[roomId]) {
        roomSceneTimers[roomId].forEach(timer => clearTimeout(timer));
        roomSceneTimers[roomId] = [];
    }
}

function scheduleSceneInteractions(roomId, startTime) {
    clearRoomTimers(roomId);
    
    if (!roomVideoStates[roomId]?.isPlaying) {
        return; // Don't schedule if video isn't playing
    }

    roomSceneTimers[roomId] = [];
    const currentTime = Date.now();

    Object.values(sceneChunks).forEach(scene => {
        const timeUntilInteraction = (scene.end - startTime) * 1000; // Convert to milliseconds

        if (timeUntilInteraction > 0) {
            const timer = setTimeout(() => {
                // Only send interaction if video is still playing
                if (roomVideoStates[roomId]?.isPlaying) {
                    const interactionType = getRandomType();
                    const payload = {
                        type: interactionType,
                        scene: scene.scene
                    };
                    // console.log(payload);
                    if (interactionType === 'trivia') {
                        payload.question = scene.trivia_question;
                        payload.choices = scene.trivia_choices;
                    } else if (interactionType === 'fun_fact') {
                        payload.fact = scene.fun_fact;
                    } else if (interactionType === 'poll') {
                        payload.question = scene.poll_question;
                        payload.options = scene.poll_options;
                    }

                    io.to(roomId).emit('scene-interaction', payload);

                    if (interactionType !== 'fun_fact') {
                        sceneInteractionResults[`${roomId}-${scene.scene}`] = {
                            type: interactionType,
                            responses: {},
                            total: 0
                        };
                    }
                }
            }, timeUntilInteraction);

            roomSceneTimers[roomId].push(timer);
        }
    });
}



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
        if (!roomUsers[roomId]) {
            roomUsers[roomId] = [];
            roomVideoStates[roomId] = { isPlaying: false, currentTime: 0 };
        }
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
        roomVideoStates[roomId] = { isPlaying: false, currentTime: 0 };
        clearRoomTimers(roomId);
    });

    socket.on('submit-answer', ({ roomId, type, scene, username, answer }) => {
        if (!roomAnswers[roomId]) roomAnswers[roomId] = {};
        if (!roomAnswers[roomId][scene]) roomAnswers[roomId][scene] = [];

        roomAnswers[roomId][scene].push({ username, answer });

        io.to(roomId).emit('answer-submitted', {
            scene,
            type,
            answer,
            username,
            allAnswers: roomAnswers[roomId][scene],
        });
    });



    socket.on('interaction-response', ({ roomId, scene, answer, username }) => {
        const key = `${roomId}-${scene}`;
        const data = sceneInteractionResults[key];
        if (!data) return;

        data.responses[username] = answer;
        data.total++;

        // Tally results
        const resultTally = {};
        for (const resp of Object.values(data.responses)) {
            resultTally[resp] = (resultTally[resp] || 0) + 1;
        }

        io.to(roomId).emit('interaction-results', {
            scene,
            type: data.type,
            results: resultTally,
            total: data.total
        });
    });




    socket.on('play', ({ roomId, time }) => {
        roomVideoStates[roomId] = { isPlaying: true, currentTime: time };
        socket.to(roomId).emit('play', time);
        // Schedule interactions from current time
        scheduleSceneInteractions(roomId, time);
    });

    socket.on('pause', ({ roomId, time }) => {
        roomVideoStates[roomId] = { isPlaying: false, currentTime: time };
        socket.to(roomId).emit('pause', time);
        // Clear scheduled interactions
        clearRoomTimers(roomId);
    });

    socket.on('seek', ({ roomId, time }) => {
        roomVideoStates[roomId].currentTime = time;
        socket.to(roomId).emit('seek', time);
        // Reschedule interactions from new time if video is playing
        if (roomVideoStates[roomId].isPlaying) {
            scheduleSceneInteractions(roomId, time);
        }
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

        if (sessionHosts[roomId] === socket.id) {
            clearRoomTimers(roomId);
            delete roomVideoStates[roomId];
        }

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
